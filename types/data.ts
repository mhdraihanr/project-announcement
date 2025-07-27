import type {
  User,
  Stat,
  QuickAction,
  Event,
  Document,
  Announcement,
  Message,
  ChatChannel,
} from "./index";
import {
  Bell,
  Calendar,
  FileText,
  MessageCircle,
  Users,
  Eye,
} from "lucide-react";

// Removed defaultUser as it's not compatible with Supabase structure
// Use actual user data from Supabase instead

export const stats: Stat[] = [
  {
    title: "Documents",
    value: "248",
    change: "+12%",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Officer",
    value: "156",
    change: "+3%",
    icon: Users,
    color: "text-green-600",
  },
  {
    title: "Views",
    value: "12",
    change: "+2",
    icon: Eye,
    color: "text-orange-600",
  },
  {
    title: "Schedule",
    value: "8",
    change: "+2",
    icon: Calendar,
    color: "text-purple-600",
  },
];

export const quickActions: QuickAction[] = [
  {
    title: "Upload Document",
    description: "Share files with your team",
    icon: FileText,
    action: () => (window.location.href = "/documents"),
  },
  {
    title: "New Announcement",
    description: "Post company updates",
    icon: Bell,
    action: () => (window.location.href = "/announcements"),
  },
  {
    title: "Schedule Meeting",
    description: "Book conference rooms",
    icon: Calendar,
    action: () => (window.location.href = "/calendar"),
  },
  {
    title: "Start Chat",
    description: "Connect with colleagues",
    icon: MessageCircle,
    action: () => (window.location.href = "/chat"),
  },
];

export const recentActivities = [
  {
    action: "Document uploaded",
    file: "Q4_Report.pdf",
    time: "2 hours ago",
  },
  {
    action: "Meeting scheduled",
    file: "Team Standup",
    time: "4 hours ago",
  },
  {
    action: "Announcement posted",
    file: "Holiday Schedule",
    time: "1 day ago",
  },
  {
    action: "Document shared",
    file: "Budget_2024.xlsx",
    time: "2 days ago",
  },
];

export const latestAnnouncements = [
  {
    title: "System Maintenance",
    content: "Scheduled maintenance on Sunday 2 AM - 4 AM",
    priority: "high",
    time: "1 hour ago",
  },
  {
    title: "New Office Hours",
    content: "Updated working hours effective next Monday",
    priority: "medium",
    time: "3 hours ago",
  },
  {
    title: "Team Building Event",
    content: "Annual company retreat registration open",
    priority: "low",
    time: "1 day ago",
  },
];

// Removed defaultDocuments as documents are now fetched from Supabase
// Use actual document data from the documents table instead

export const defaultChannels: ChatChannel[] = [
  {
    id: "general",
    name: "General",
    type: "public",
    members: 156,
    unread: 0,
    requiredRole: "Employee",
  },
  {
    id: "announcements",
    name: "Announcements",
    type: "public",
    members: 156,
    unread: 3,
    requiredRole: "Employee",
  },
  {
    id: "it-support",
    name: "IT Support",
    type: "public",
    members: 45,
    unread: 1,
    requiredRole: "Employee",
  },
  {
    id: "management",
    name: "Management",
    type: "private",
    members: 12,
    unread: 0,
    requiredRole: "Officer",
  },
  {
    id: "admin",
    name: "Admin Only",
    type: "private",
    members: 3,
    unread: 0,
    requiredRole: "Administrator",
  },
  {
    id: "sales-team",
    name: "Sales Team",
    type: "department",
    members: 25,
    unread: 2,
    requiredRole: "Employee",
    department: "Sales",
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    type: "department",
    members: 18,
    unread: 0,
    requiredRole: "Employee",
    department: "Marketing",
  },
];

// Removed defaultMessages as messages are now handled by Supabase
// Use actual message data from the chat_messages table instead

// Removed defaultAnnouncements as announcements are now fetched from Supabase
// Use actual announcement data from the announcements table instead

export const defaultEvents: Event[] = [
  {
    id: "1",
    title: "Team Standup",
    description: "Daily team synchronization meeting",
    date: "2024-03-08",
    startTime: "09:00",
    endTime: "09:30",
    location: "Conference Room A",
    type: "meeting",
    organizer: "Sarah Johnson",
    attendees: ["John Doe", "Mike Wilson", "Sarah Johnson"],
    department: "Sales",
    isPrivate: false,
    color: "blue",
  },
  {
    id: "2",
    title: "Q1 Budget Review",
    description: "Quarterly budget analysis and planning session",
    date: "2024-03-08",
    startTime: "14:00",
    endTime: "16:00",
    location: "Boardroom",
    type: "presentation",
    organizer: "Management",
    attendees: ["Managers", "Finance Team"],
    department: "Finance",
    isPrivate: true,
    color: "red",
  },
  {
    id: "3",
    title: "System Maintenance",
    description: "Scheduled server maintenance and updates",
    date: "2024-03-10",
    startTime: "02:00",
    endTime: "04:00",
    location: "Server Room",
    type: "maintenance",
    organizer: "IT Department",
    attendees: ["IT Team"],
    department: "IT",
    isPrivate: false,
    color: "orange",
  },
  {
    id: "4",
    title: "Company All-Hands",
    description: "Monthly company-wide meeting",
    date: "2024-03-15",
    startTime: "10:00",
    endTime: "11:30",
    location: "Main Hall",
    type: "presentation",
    organizer: "CEO",
    attendees: ["All Employees"],
    department: "General",
    isPrivate: false,
    color: "green",
  },
];
