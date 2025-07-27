"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@/types";

type UserContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useUser = () => {
  return useContext(UserContext);
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Starting fetchUser...");

        // Get session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session found");
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("Session found for user:", session.user.id);

        // First, try to get user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(
            "id, name, email, role_id, department, position, avatar_url, created_at, updated_at"
          )
          .eq("id", session.user.id)
          .single();

        if (userError) {
          console.error("User data error:", userError);
          throw userError;
        }

        if (!userData) {
          console.log("No user data found");
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("User data found:", userData);

        // Then get role data
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id, name, level, description, created_at, updated_at")
          .eq("id", userData.role_id)
          .single();

        if (roleError) {
          console.error("Role data error:", roleError);
          throw roleError;
        }

        if (!roleData) {
          console.log("No role data found");
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("Role data found:", roleData);

        const userWithRole: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email || session.user.email || "",
          role_id: userData.role_id,
          role: {
            id: roleData.id,
            name: roleData.name,
            level: roleData.level,
            description: roleData.description,
            created_at: roleData.created_at,
            updated_at: roleData.updated_at,
          },
          department: userData.department,
          position: userData.position,
          avatar_url: userData.avatar_url,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        };

        console.log("Setting user:", userWithRole);
        setUser(userWithRole);
      } catch (error) {
        console.error("Error in fetchUser:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      console.log("Auth state change:", event);
      if (event === "SIGNED_IN") {
        fetchUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}
