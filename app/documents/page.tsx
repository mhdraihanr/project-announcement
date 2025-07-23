import DocumentCenter from "@/components/DocumentCenter";
import type { User } from "@/types";

export default function DocumentsPage() {
  // This is temporary - in real app would come from auth/session
  const currentUser: User = {
    id: 1,
    name: "John Doe",
    role: "Employee",
    department: "IT",
    avatar: "/avatars/default.png",
  };

  return <DocumentCenter currentUser={currentUser} />;
}
