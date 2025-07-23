"use client";

import { useEffect } from "react";
import { useUser } from "@/components/providers/user-provider";
import { useRouter } from "next/navigation";
import OfficerMembers from "@/components/OfficerMembers";

export default function OfficerPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Only show loading on initial load, not on subsequent auth state changes
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground text-lg">Loading...</span>
      </div>
    );
  }

  // Jika user null (sudah dicek di useEffect), return null agar tidak flicker
  if (!user) return null;

  return <OfficerMembers currentUser={user} />;
}
