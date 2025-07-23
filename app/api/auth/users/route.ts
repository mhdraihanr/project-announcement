import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/auth/users
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const department = searchParams.get("department");

    let query = supabase.from("users").select(`
      *,
      roles (
        name,
        level,
        description
      )
    `);

    if (role) {
      query = query.eq("roles.name", role);
    }

    if (department) {
      query = query.eq("department", department);
    }

    const { data: users, error } = await query.order("name");

    if (error) throw error;

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/auth/users
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
    const { name, role_id, department, position, email } = body;

    // First create auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: "password123", // temporary password
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) throw authError;

    // Then create public user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authUser.user.id,
          name,
          role_id,
          department,
          position,
          email,
          avatar_url: `https://api.dicebear.com/7.x/avatars/svg?seed=${email}`,
        },
      ])
      .select(
        `
        *,
        roles (
          name,
          level,
          description
        )
      `
      )
      .single();

    if (userError) throw userError;

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
