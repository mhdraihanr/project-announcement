import ChatSystem from "@/components/ChatSystem";
import type { User, Role } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ChatPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUser: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.user_metadata.name,
        role_id: "1", // TODO: Fetch role_id from user metadata or database
        role: {
          id: "1", // TODO: Fetch role from user metadata or database
          name: "Admin", // TODO: Fetch role from user metadata or database
          level: 1, // TODO: Fetch role from user metadata or database
        },
        department: "IT", // TODO: Fetch department from user metadata or database
      }
    : null;

  return currentUser ? <ChatSystem currentUser={currentUser} /> : null;
}
