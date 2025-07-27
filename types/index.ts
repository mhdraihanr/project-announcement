import { LucideIcon } from "lucide-react";

// Role types
export type UserRole =
  | "Administrator"
  | "Senior VP"
  | "VP"
  | "Officer"
  | "Employee";

export interface Role {
  id: string;
  name: string;
  level: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role_id: string;
  role?: Role;
  department: string;
  position?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  head_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  time: string;
  unread: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "document" | "spreadsheet" | "image";
  size: string;
  content_url?: string;
  uploaded_by: string;
  uploaded_by_user?: { name: string }; // Added for uploader's name
  created_at: string;
  department: string;
  departments?: string[]; // Added for multiple department support
  access_level: "Employee" | "Officer" | "VP" | "Senior VP";
  access_levels?: string[]; // Added for multiple access level support
  downloads: number;
  views: number;
  shared: boolean;
  updated_at?: string;
}

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: "meeting" | "presentation" | "training" | "maintenance";
  organizer: string;
  attendees: string[];
  department: string;
  isPrivate: boolean;
  color: string;
};

export interface Announcement {
  authorAvatar: string;
  authorName: string;
  id: string;
  title: string;
  content: string;
  author: string;
  department?: string; // Keep for backward compatibility
  departments?: string[]; // New field for multiple departments
  priority: "low" | "medium" | "high";
  pinned: boolean;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export type ChatChannel = {
  id: string;
  name: string;
  type: "public" | "private" | "department";
  members: number;
  unread: number;
  requiredRole: UserRole;
  department?: string;
};

export type Message = {
  id: string;
  user: string;
  role: UserRole;
  message: string;
  timestamp: string;
  avatar: string;
  isSystem?: boolean;
};

export type Stat = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
};

export type QuickAction = {
  title: string;
  description: string;
  icon: LucideIcon;
  action: () => void;
};

export interface UserHierarchySummary {
  role: string;
  role_level: number;
  department: string;
  user_count: number;
  last_updated: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user: {
    id: string;
    name: string;
    role: {
      name: string;
    };
    avatar_url?: string | null;
  };
  message: string;
  timestamp: string;
}

// Analytics types
export interface AnnouncementAnalytics {
  overview: {
    totalAnnouncements: number;
    totalUsers: number;
    totalReads: number;
    averageReads: number;
    totalUnreads: number;
    overallReadPercentage: number;
  };
  recentAnnouncements: Array<{
    id: string;
    title: string;
    readCount: number;
    unreadCount: number;
    readPercentage: number;
    createdAt: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    announcements: number;
    totalReads: number;
    averageReadRate: number;
  }>;
  userReadStatus: Array<{
    userId: string;
    userName: string;
    userRole: string;
    userDepartment: string;
    readAnnouncements: number;
    unreadAnnouncements: number;
  }>;
}

export interface DocumentAnalytics {
  overview: {
    totalDocuments: number;
    totalUsers: number;
    totalReads: number;
    totalDownloads: number;
    averageReads: number;
    averageDownloads: number;
    totalRead: number;
    totalNotRead: number;
    totalDownloaded: number;
    totalNotDownloaded: number;
    overallReadPercentage: number;
    overallDownloadPercentage: number;
  };
  recentDocuments: Array<{
    id: string;
    title: string;
    readCount: number;
    downloadCount: number;
    readPercentage: number;
    downloadPercentage: number;
    createdAt: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    documents: number;
    totalReads: number;
    totalDownloads: number;
    averageReadRate: number;
    averageDownloadRate: number;
  }>;
  documentTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  userReadStatus: Array<{
    userId: string;
    userName: string;
    userRole: string;
    userDepartment: string;
    readDocuments: number;
    unreadDocuments: number;
    downloadedDocuments: number;
  }>;
}

export interface AnnouncementUserReadStatus {
  userId: string;
  userName: string;
  userRole: string;
  userDepartment: string;
  readAnnouncements: number;
  unreadAnnouncements: number;
}

export interface DocumentUserReadStatus {
  userId: string;
  userName: string;
  userRole: string;
  userDepartment: string;
  readDocuments: number;
  unreadDocuments: number;
  downloadedDocuments: number;
}
