import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // First, try to get announcements with user_id join
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select(
        `
        *
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error in GET announcements:", error);
      throw error;
    }

    // Get user data separately and merge
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, avatar_url");

    if (usersError) {
      console.error("Error fetching users:", usersError);
    }

    // Transform the data to include author info
    const transformedAnnouncements =
      announcements?.map((announcement) => {
        // Try to find user by user_id first, then by email in author field
        let user = null;
        if (announcement.user_id && users) {
          user = users.find((u) => u.id === announcement.user_id);
        }

        // If no user found by user_id, try to find by email
        if (!user && users && announcement.author) {
          // Get auth users to match email
          // For now, we'll use the author field as fallback
        }

        return {
          ...announcement,
          authorName: user?.name || announcement.author || "Unknown User",
          authorAvatar: user?.avatar_url || null,
        };
      }) || [];

    return NextResponse.json(transformedAnnouncements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST request received for announcements");

    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    console.log("Request body:", JSON.stringify(body, null, 2));

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user:", user.id);

    // Handle both single department (backward compatibility) and multiple departments
    const departmentData = body.departments || [body.department || "All"];
    console.log("Department data:", departmentData);

    // Insert data with both department and departments fields
    const insertData = {
      title: body.title ? body.title.trim() : "",
      content: body.content || "", // Don't trim content to preserve line breaks
      user_id: user.id, // Store user ID as foreign key
      author: user?.email || "Unknown User", // Keep for backward compatibility
      department: departmentData.includes("All")
        ? "All"
        : departmentData.join(", "), // Comma-separated string for backward compatibility
      departments: departmentData, // Array for new multiple department support
      priority: body.priority || "medium",
      pinned: body.pinned || false,
      views: body.views || 0,
      likes: body.likes || 0,
      comments: body.comments || 0,
      tags: Array.isArray(body.tags) ? body.tags : [],
    };

    console.log("Department data:", departmentData);
    console.log("Will be stored as department:", insertData.department);
    console.log("Will be stored as departments:", insertData.departments);

    console.log("Insert data:", JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from("announcements")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);

      return NextResponse.json(
        {
          error: "Failed to create announcement",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log("Successfully created announcement:", data);
    
    // Transform the response to include author info like in GET
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .eq("id", user.id)
      .single();

    const transformedData = {
      ...data,
      authorName: users?.name || user?.email || "Unknown User",
      authorAvatar: users?.avatar_url || null,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error creating announcement:", error);
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);

    // Better error serialization
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    console.error("Error details:", JSON.stringify(errorDetails, null, 2));

    return NextResponse.json(
      {
        error: "Failed to create announcement",
        details: errorMessage,
        type: error?.constructor?.name || typeof error,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { id, ...updates } = body;

    console.log("PATCH request for announcement:", id);
    console.log("Updates:", JSON.stringify(updates, null, 2));

    // Handle departments update
    if (updates.departments) {
      updates.department = updates.departments.includes("All")
        ? "All"
        : updates.departments.join(", ");
      // Keep departments as array for new functionality
    }

    const { data, error } = await supabase
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    // Transform the response to include author info like in GET
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .eq("id", data.user_id)
      .single();

    const transformedData = {
      ...data,
      authorName: users?.name || data.author || "Unknown User",
      authorAvatar: users?.avatar_url || null,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    console.log("DELETE request for announcement:", id);

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
