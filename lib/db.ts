import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

// Helper functions for user management
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Get additional user data from our custom table
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return {
      id: user.id,
      email: user.email,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      avatar: userData.avatar_url,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function updateUserRole(
  userId: string,
  role: string,
  department: string
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        role: role,
        department: department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}
