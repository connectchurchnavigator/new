import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ exists: false, error: "Invalid email" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = createAdminClient();

    // Supabase admin listUsers (paginate up to 1000 users per page)
    let page = 1;
    const perPage = 1000;
    let exists = false;

    while (!exists) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

      if (error) {
        console.error("Error checking user existence:", error);
        return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
      }

      const users = data?.users || [];
      if (users.length === 0) {
        break;
      }

      exists = users.some((u) => u.email?.toLowerCase() === cleanEmail);
      if (exists || users.length < perPage) {
        break;
      }

      page++;
    }

    return NextResponse.json({ exists });
  } catch (err: any) {
    console.error("User existence check error:", err);
    return NextResponse.json({ exists: false, error: err.message || "Internal error" }, { status: 500 });
  }
}
