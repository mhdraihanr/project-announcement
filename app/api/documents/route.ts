import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Documents API: Starting GET request");
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("Documents API: No user found or auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Documents API: User authenticated:", user.id);

    // Get user role info for debugging
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*, role:role_id(name, level)")
      .eq("id", user.id)
      .single();

    if (userData) {
      console.log("Documents API: User data:", {
        name: userData.name,
        role: userData.role?.name,
        level: userData.role?.level,
        department: userData.department,
      });
    }

    // Fetch documents that user can access based on RLS policies
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*, uploaded_by_user:uploaded_by(name)") // Select document fields and uploader's name
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Documents API: Error fetching documents:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }

    console.log("Documents API: Found", documents?.length || 0, "documents");
    if (documents && documents.length > 0) {
      console.log("Documents API: Sample document:", documents[0]);
    }

    return NextResponse.json(documents || []);
  } catch (error) {
    console.error("Documents API: Error in GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data to check role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*, roles(*)")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has permission to upload (VP and above)
    if (!userData.roles || userData.roles.level > 3) {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. Only VP and above can upload documents.",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const accessLevel = formData.get("accessLevel") as string;
    const department = formData.get("department") as string;
    const departmentsData = formData.get("departments") as string;
    const accessLevelsData = formData.get("accessLevels") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(fileData.path);

    // Parse departments data
    let departments = [];
    try {
      if (departmentsData) {
        departments = JSON.parse(departmentsData);
      }
    } catch (error) {
      console.error("Error parsing departments data:", error);
      departments = [department || userData.department || "All"];
    }

    // Parse access levels data
    let accessLevels = [];
    try {
      if (accessLevelsData) {
        accessLevels = JSON.parse(accessLevelsData);
      }
    } catch (error) {
      console.error("Error parsing access levels data:", error);
      accessLevels = [accessLevel || "Employee"];
    }

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert([
        {
          name: file.name,
          type: getFileType(file.type),
          size: formatFileSize(file.size),
          content_url: publicUrl,
          uploaded_by: user.id,
          department: departments.includes("All")
            ? "All"
            : departments.join(", "),
          departments: departments, // Add departments array if table supports it
          access_level: accessLevel,
          access_levels: accessLevels, // Add access levels array if table supports it
          downloads: 0,
          views: 0,
          shared: false,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Error creating document record:", dbError);
      throw dbError;
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
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
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data to check role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*, roles(*)")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only Admin and Senior VP can delete
    if (!userData.roles || userData.roles.level > 2) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get document to delete file from storage
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("content_url")
      .eq("id", id)
      .single();

    if (docError) {
      console.error("Error fetching document:", docError);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete file from storage
    if (document?.content_url) {
      const fileName = document.content_url.split("/").pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([fileName]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting document:", deleteError);
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

// Helper functions
function getFileType(
  mimeType: string
): "pdf" | "document" | "spreadsheet" | "image" {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return "spreadsheet";
  if (mimeType.includes("image")) return "image";
  return "document";
}

function formatFileSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(1)} MB`;
}
