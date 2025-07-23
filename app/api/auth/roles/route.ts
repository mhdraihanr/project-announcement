import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/auth/roles
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: roles, error } = await supabase
      .from("roles")
      .select("*")
      .order("level", { ascending: true });

    if (error) throw error;

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

// POST /api/auth/roles
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication and admin status
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userData?.role !== "Administrator") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, level, description } = body;

    const { data, error } = await supabase
      .from("roles")
      .insert([{ name, level, description }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
