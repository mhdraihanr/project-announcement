import CalendarView from "@/components/CalendarView";
import type { User } from "@/types";

export default function CalendarPage() {
  // This is temporary - in real app would come from auth/session
  const currentUser: User = {
    id: "1",
    name: "John Doe",
    role_id: "admin-role-id",
    role: {
      id: "admin-role-id",
      name: "Administrator",
      level: 1
    },
    department: "IT",
    avatar_url: "/avatars/default.png",
  };

  return <CalendarView currentUser={currentUser} />;
}
