import DocumentCenter from "@/components/DocumentCenter";
import type { User } from "@/types";

export default function DocumentsPage() {
  // This is temporary - in real app would come from auth/session
  const currentUser: User = {
    id: "1",
    name: "John Doe",
    role_id: "employee-role-id",
    role: {
      id: "employee-role-id",
      name: "Employee",
      level: 5
    },
    department: "IT",
    avatar_url: "/avatars/default.png",
  };

  return <DocumentCenter currentUser={currentUser} />;
}
