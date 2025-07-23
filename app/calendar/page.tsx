import CalendarView from "@/components/CalendarView";
import type { User } from "@/types";

export default function CalendarPage() {
  // This is temporary - in real app would come from auth/session
  const currentUser: User = {
    id: 1,
    name: "John Doe",
    role: "Admin",
    department: "IT",
    avatar: "/avatars/default.png",
  };

  return <CalendarView currentUser={currentUser} />;
}
