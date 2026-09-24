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
 * DELETE: Remove a team member user by ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedUserId: userId });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
