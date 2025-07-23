import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/auth/users/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from("users")
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
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/users/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    if (userData?.role !== "Administrator" && session.user.id !== params.id) {
      return NextResponse.json(
        {
          error:
            "Unauthorized - Can only update own profile or need admin access",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, role_id, department, position } = body;

    const { data, error } = await supabase
      .from("users")
      .update({ name, role_id, department, position })
      .eq("id", params.id)
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

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/users/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // First delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(
      params.id
    );
    if (authError) throw authError;

    // Then delete from public users
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("id", params.id);

    if (userError) throw userError;

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
