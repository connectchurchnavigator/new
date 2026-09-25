import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * GET: List all provisioned team members across all churches / pastors
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter users who have team role metadata
    const teamUsers = (users.users || [])
      .filter((u) => u.user_metadata?.is_team_member || u.user_metadata?.team_role)
      .map((u) => ({
        id: u.id,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Team Member",
        email: u.email || "",
        role: u.user_metadata?.team_role || "events_only",
        assignedChurches: u.user_metadata?.assigned_churches || (u.user_metadata?.assigned_church ? [u.user_metadata.assigned_church] : []),
        assignedPastors: u.user_metadata?.assigned_pastors || (u.user_metadata?.assigned_pastor ? [u.user_metadata.assigned_pastor] : []),
        churchNames: u.user_metadata?.assigned_church_names || [],
        pastorNames: u.user_metadata?.assigned_pastor_names || [],
        status: "active",
        addedAt: u.created_at ? u.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      }));

    return NextResponse.json({ success: true, teamUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Create a team member in Supabase Auth with custom password & metadata
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role = "events_only",
      assignedChurches = [],
      assignedPastors = [],
      churchNames = [],
      pastorNames = [],
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required to create a team member." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Create or invite user via Supabase Auth Admin API (automatically confirmed, no verification link wait)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true, // auto-confirm email so they can log in immediately
      user_metadata: {
        full_name: name.trim(),
        name: name.trim(),
        is_team_member: true,
        team_role: role,
        role: "listing_manager", // base role allowing dashboard access
        assigned_churches: assignedChurches,
        assigned_pastors: assignedPastors,
        assigned_church_names: churchNames,
        assigned_pastor_names: pastorNames,
      },
    });

    if (createError) {
      // If user already exists in auth, update their password & metadata
      if (createError.message.toLowerCase().includes("already registered") || createError.message.toLowerCase().includes("already exists")) {
        const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const existing = listData?.users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
        
        if (existing) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
            password: password,
            email_confirm: true,
            user_metadata: {
              ...existing.user_metadata,
              full_name: name.trim(),
              name: name.trim(),
              is_team_member: true,
              team_role: role,
              assigned_churches: assignedChurches,
              assigned_pastors: assignedPastors,
              assigned_church_names: churchNames,
              assigned_pastor_names: pastorNames,
            },
          });

          if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 });
          }

          return NextResponse.json({
            success: true,
            user: {
              id: existing.id,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              role,
              assignedChurches,
              assignedPastors,
              churchNames,
              pastorNames,
              status: "active",
              addedAt: new Date().toISOString().split("T")[0],
            },
            updated: true,
          });
        }
      }

      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const createdUser = userData.user;

    // 2. Also register into public.profiles if the table exists
    try {
      await supabase.from("profiles").upsert(
        {
          id: createdUser.id,
          role: "listing_manager",
          full_name: name.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch {
      // profiles table might have custom schema; non-critical
    }

    return NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        assignedChurches,
        assignedPastors,
        churchNames,
        pastorNames,
        status: "active",
        addedAt: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE: Remove a team member user by ID (or email)
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email parameter is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let targetUserId = userId;
    if (!targetUserId || !uuidRegex.test(targetUserId)) {
      // Look up by email
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const found = listData?.users.find((u) => 
        (email && u.email?.toLowerCase() === email.toLowerCase()) ||
        (userId && u.email?.toLowerCase() === userId.toLowerCase())
      );
      if (found) {
        targetUserId = found.id;
      }
    }

    if (!targetUserId || !uuidRegex.test(targetUserId)) {
      // Fallback: If not found in auth, consider already deleted
      return NextResponse.json({ success: true, deletedUserId: userId });
    }

    const { error } = await supabase.auth.admin.deleteUser(targetUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedUserId: targetUserId });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH: Reset password or update team member role / details
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, newPassword, role, assignedChurches, assignedPastors, churchNames, pastorNames } = body;

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let targetUserId = userId;

    // If userId is not a valid UUID (e.g. 'tm-174...', 'tm-1', etc.), find the actual UUID by email
    if (!targetUserId || !uuidRegex.test(targetUserId)) {
      const searchEmail = email || (userId && userId.includes("@") ? userId : null);
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const found = listData?.users.find((u) => {
        if (searchEmail && u.email?.toLowerCase() === searchEmail.toLowerCase()) return true;
        return false;
      });

      if (found) {
        targetUserId = found.id;
      } else if (searchEmail && newPassword) {
        // User was in local state but not yet committed to Supabase Auth -> provision them now!
        const memberName = body.name || searchEmail.split("@")[0] || "Team Member";
        const { data: newlyCreated, error: createErr } = await supabase.auth.admin.createUser({
          email: searchEmail.trim().toLowerCase(),
          password: newPassword,
          email_confirm: true,
          user_metadata: {
            full_name: memberName,
            name: memberName,
            is_team_member: true,
            team_role: role || "events_only",
            role: "listing_manager",
            assigned_churches: assignedChurches || [],
            assigned_pastors: assignedPastors || [],
            assigned_church_names: churchNames || [],
            assigned_pastor_names: pastorNames || [],
          },
        });

        if (createErr) {
          return NextResponse.json({ error: createErr.message }, { status: 400 });
        }

        try {
          await supabase.from("profiles").upsert(
            {
              id: newlyCreated.user.id,
              role: "listing_manager",
              full_name: memberName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        } catch {}

        return NextResponse.json({
          success: true,
          message: "User successfully created and activated in Supabase Auth with this password!",
          user: newlyCreated.user,
        });
      } else {
        return NextResponse.json(
          { error: `Could not locate user in Supabase Auth with ID: ${userId}. Please verify the email address is correct.` },
          { status: 400 }
        );
      }
    }

    const updateAttrs: any = {};
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
      }
      updateAttrs.password = newPassword;
      updateAttrs.email_confirm = true;
    }

    // If metadata changes provided
    if (role || assignedChurches || assignedPastors) {
      const { data: userObj } = await supabase.auth.admin.getUserById(targetUserId);
      const currentMeta = userObj?.user?.user_metadata || {};
      updateAttrs.user_metadata = {
        ...currentMeta,
        ...(role ? { team_role: role } : {}),
        ...(assignedChurches ? { assigned_churches: assignedChurches } : {}),
        ...(assignedPastors ? { assigned_pastors: assignedPastors } : {}),
        ...(churchNames ? { assigned_church_names: churchNames } : {}),
        ...(pastorNames ? { assigned_pastor_names: pastorNames } : {}),
      };
    }

    const { data, error } = await supabase.auth.admin.updateUserById(targetUserId, updateAttrs);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: newPassword ? "Password has been successfully reset!" : "User updated successfully.",
      user: data.user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

