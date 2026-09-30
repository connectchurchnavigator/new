import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // 1. Get currently authenticated session user
    const serverSupabase = await createServerSupabaseClient();
    const { data: { user }, error: userErr } = await serverSupabase.auth.getUser();

    if (userErr || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
    }

    // 2. Verify password by attempting to sign in using client credentials
    const testClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: authErr } = await testClient.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (authErr) {
      return NextResponse.json({ error: "Invalid password. Access denied." }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: "Password verified" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
