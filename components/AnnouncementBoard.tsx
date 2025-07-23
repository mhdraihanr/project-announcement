"use client";

import { useState, useEffect } from "react";
import type { User, Announcement, Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pin,
  Eye,
  ThumbsUp,
  MessageSquare,
  Filter,
  Trash2,
  Edit,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/components/providers/user-provider";

export default function AnnouncementBoard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "medium",
    departments: [] as string[], // Changed to array for multiple selection
    tags: "",
  });

  const [filterPriority, setFilterPriority] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Fetch announcements and departments from API
  useEffect(() => {
    fetchAnnouncements();
    fetchDepartments();
    const interval = setInterval(fetchAnnouncements, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else {
        setAnnouncements([]);
        toast({
          title: "Error",
          description: "Failed to load announcements",
          variant: "destructive",
        });
      }
    } catch (error) {
      setAnnouncements([]);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      // Validate user is logged in
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create announcements",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!newAnnouncement.title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive",
        });
        return;
      }

      if (!newAnnouncement.content || newAnnouncement.content.trim() === "") {
        toast({
          title: "Error",
          description: "Content is required",
          variant: "destructive",
        });
        return;
      }

      const requestData = {
        title: newAnnouncement.title.trim(),
        content: newAnnouncement.content, // Don't trim to preserve line breaks
        author: user?.name || user?.email || "Unknown User",
        departments:
          newAnnouncement.departments.length > 0
            ? newAnnouncement.departments
            : ["All"], // If no departments selected, default to "All"
        priority: newAnnouncement.priority,
        pinned: false,
        views: 0,
        likes: 0,
        comments: 0,
        tags: newAnnouncement.tags
          ? newAnnouncement.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      console.log("Sending request data:", requestData);

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok && data && data.id) {
        setAnnouncements([data, ...announcements]);
        setNewAnnouncement({
          title: "",
          content: "",
          priority: "medium",
          departments: [],
          tags: "",
        });
        setIsCreateDialogOpen(false); // Close dialog after successful creation
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      } else {
        // Handle API error response
        const errorMessage =
          data?.details || data?.error || "Failed to create announcement";
        console.error("API Error:", data);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditAnnouncement = async () => {
    if (!editingAnnouncement) return;
    try {
      const res = await fetch("/api/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAnnouncement.id,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          priority: newAnnouncement.priority,
          departments:
            newAnnouncement.departments.length > 0
              ? newAnnouncement.departments
              : ["All"],
          tags: newAnnouncement.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data && data.id) {
        setAnnouncements(
          announcements.map((a) => (a.id === data.id ? data : a))
        );
        setEditingAnnouncement(null);
        setNewAnnouncement({
          title: "",
          content: "",
          priority: "",
          departments: [],
          tags: "",
        });
        setIsCreateDialogOpen(false); // Close dialog after successful update
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        throw new Error("Failed to update announcement");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data && data.success) {
        setAnnouncements(announcements.filter((a) => a.id !== id));
        toast({
          title: "Success",
          description: "Announcement deleted successfully",
        });
      } else {
        throw new Error("Failed to delete announcement");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const res = await fetch("/api/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: announcement.id,
          pinned: !announcement.pinned,
        }),
      });
      const data = await res.json();
      if (data && data.id) {
        setAnnouncements(
          announcements.map((a) => (a.id === data.id ? data : a))
        );
        toast({
          title: "Success",
          description: `Announcement ${
            data.pinned ? "pinned" : "unpinned"
          } successfully`,
        });
      } else {
        throw new Error("Failed to update pin");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const startEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      departments: Array.isArray(announcement.departments)
        ? announcement.departments
        : [announcement.department || ""],
      tags: announcement.tags.join(", "),
    });
    setIsCreateDialogOpen(true); // Open dialog for editing
  };

  const handleDepartmentChange = (departmentName: string, checked: boolean) => {
    if (departmentName === "All") {
      // If "All" is selected, clear other selections and set only "All"
      if (checked) {
        setNewAnnouncement({
          ...newAnnouncement,
          departments: ["All"],
        });
      } else {
        setNewAnnouncement({
          ...newAnnouncement,
          departments: [],
        });
      }
    } else {
      // If a specific department is selected
      let updatedDepartments = [...newAnnouncement.departments];

      // Remove "All" if it exists when selecting specific departments
      updatedDepartments = updatedDepartments.filter((dept) => dept !== "All");

      if (checked) {
        updatedDepartments.push(departmentName);
      } else {
        updatedDepartments = updatedDepartments.filter(
          (dept) => dept !== departmentName
        );
      }

      setNewAnnouncement({
        ...newAnnouncement,
        departments: updatedDepartments,
      });
    }
  };

  const filteredAnnouncements = announcements
    .filter(
      (announcement) =>
        filterPriority === "all" || announcement.priority === filterPriority
    )
    .filter((announcement) => {
      if (filterDepartment === "all") return true;

      // Check if announcement targets all departments
      if (
        announcement.departments &&
        announcement.departments.includes("All")
      ) {
        return true;
      }

      // Check if announcement targets the specific department
      if (
        announcement.departments &&
        announcement.departments.includes(filterDepartment)
      ) {
        return true;
      }

      // Fallback to old department field for backward compatibility
      if (
        announcement.department === filterDepartment ||
        announcement.department === "All"
      ) {
        return true;
      }

      return false;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  // Officer & Employee cannot create or delete
  const canCreateOrDelete =
    user?.role?.name !== "Officer" && user?.role?.name !== "Employee";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
          <p className="text-muted-foreground">
            Stay updated with company news and updates
          </p>
        </div>
        {canCreateOrDelete && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (open && !editingAnnouncement) {
                // Reset form for new announcement
                setNewAnnouncement({
                  title: "",
                  content: "",
                  priority: "medium",
                  departments: [],
                  tags: "",
                });
              }
              if (!open) {
                // Clear editing state when dialog closes
                setEditingAnnouncement(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement
                    ? "Edit Announcement"
                    : "Create New Announcement"}
                </DialogTitle>
                <DialogDescription>
                  Share important updates with your team
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Announcement title"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                />
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your announcement here...&#10;&#10;Use Shift+Enter for line breaks:&#10;- Point 1&#10;- Point 2"
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.shiftKey) {
                        // Allow shift+enter for new lines
                        e.stopPropagation();
                      }
                    }}
                    className="min-h-[120px] resize-none"
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Use{" "}
                    <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
                      Shift
                    </kbd>{" "}
                    +{" "}
                    <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
                      Enter
                    </kbd>{" "}
                    for line breaks
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    value={newAnnouncement.priority}
                    onValueChange={(value) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">
                    Target Departments:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border rounded-md">
                    {/* All Departments Option */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dept-all"
                        checked={newAnnouncement.departments.includes("All")}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange("All", checked as boolean)
                        }
                      />
                      <label
                        htmlFor="dept-all"
                        className="text-sm font-medium text-primary cursor-pointer"
                      >
                        All Departments
                      </label>
                    </div>

                    {/* Individual Department Options */}
                    {departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`dept-${dept.id}`}
                          checked={newAnnouncement.departments.includes(
                            dept.name
                          )}
                          onCheckedChange={(checked) =>
                            handleDepartmentChange(
                              dept.name,
                              checked as boolean
                            )
                          }
                          disabled={newAnnouncement.departments.includes("All")}
                        />
                        <label
                          htmlFor={`dept-${dept.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {dept.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {newAnnouncement.departments.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        Selected Departments:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {newAnnouncement.departments.map((dept) => (
                          <Badge
                            key={dept}
                            variant="secondary"
                            className="text-xs"
                          >
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  placeholder="Tags (comma separated)"
                  value={newAnnouncement.tags}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      tags: e.target.value,
                    })
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={
                    editingAnnouncement
                      ? handleEditAnnouncement
                      : handleCreateAnnouncement
                  }
                >
                  {editingAnnouncement
                    ? "Update Announcement"
                    : "Post Announcement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card
            key={announcement.id}
            className={`${
              announcement.pinned ? "ring-2 ring-primary" : ""
            } hover:shadow-md transition-shadow`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.pinned && (
                      <Pin className="h-4 w-4 text-primary" />
                    )}
                    <CardTitle className="text-xl">
                      {announcement.title}
                    </CardTitle>
                    <Badge variant={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                    {canCreateOrDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto "
                        onClick={() => startEdit(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canCreateOrDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive mr-3"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Announcement
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this announcement?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteAnnouncement(announcement.id)
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {announcement.authorName}</span>
                    <span>
                      {announcement.departments &&
                      announcement.departments.length > 0
                        ? announcement.departments.join(", ")
                        : announcement.department || "All Departments"}
                    </span>
                    <span>
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Avatar>
                  {announcement.authorAvatar && (
                    <AvatarImage
                      src={announcement.authorAvatar}
                      alt={announcement.authorName}
                    />
                  )}
                  <AvatarFallback>
                    {announcement.authorName
                      ? announcement.authorName.charAt(0)
                      : announcement.author
                      ? announcement.author.charAt(0)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-foreground mb-4 whitespace-pre-wrap">
                {announcement.content}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {announcement.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {announcement.views}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {announcement.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {announcement.comments}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleTogglePin(announcement)}
                  >
                    <Pin
                      className={`h-4 w-4 ${
                        announcement.pinned ? "text-primary" : ""
                      }`}
                    />
                    {announcement.pinned ? "Unpin" : "Pin"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
