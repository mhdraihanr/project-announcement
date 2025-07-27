"use client";

import { useState, useEffect } from "react";
import type { User, Document, Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/components/providers/user-provider";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  Download,
  Share2,
  MoreHorizontal,
  Eye,
  Trash2,
  Lock,
  Users,
  Calendar,
  ChevronDown,
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

interface DocumentCenterProps {
  currentUser: User;
}

export default function DocumentCenter({}: DocumentCenterProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState({
    access_level: "Employee" as Document["access_level"],
    access_levels: [] as string[],
    department: user?.department || "",
    departments: [] as string[],
  });


  // Fetch documents and departments on mount
  useEffect(() => {
    fetchDocuments();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch {
      console.error("Error fetching departments");
    }
  };

  const fetchDocuments = async () => {
    try {
      console.log("Fetching documents...");
      const response = await fetch("/api/documents");
      const data = await response.json();
      console.log("Documents API response:", data);
      if (Array.isArray(data)) {
        console.log("Setting documents:", data.length, "documents");
        setDocuments(data);
      }
    } catch {
      console.error("Error fetching documents");
    } finally {
      setLoading(false);
    }
  };

  // Add debugging for user and role
  useEffect(() => {
    console.log("Current user:", user);
    console.log("User role:", user?.role);
    console.log("User department:", user?.department);
  }, [user]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "document":
        return FileText;
      case "image":
        return Image;
      case "spreadsheet":
        return FileSpreadsheet;
      default:
        return FileText;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "Senior VP":
        return "destructive";
      case "VP":
        return "default";
      case "Officer":
        return "secondary";
      case "Employee":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getRoleLevel = (roleName: string) => {
    switch (roleName) {
      case "Administrator":
        return 1;
      case "Senior VP":
        return 2;
      case "VP":
        return 3;
      case "Officer":
        return 4;
      case "Employee":
        return 5;
      default:
        return 6;
    }
  };

  const canAccessDocument = (document: Document) => {
    if (!user?.role) return false;
    
    // Administrator dapat melihat semua dokumen
    if (user.role.name === "Administrator") return true;
    
    // Cek array access_levels jika ada, fallback ke access_level tunggal
    if (
      Array.isArray(document.access_levels) &&
      document.access_levels.length > 0
    ) {
      return document.access_levels.includes(user.role.name);
    }
    // Fallback to legacy logic
    const userLevel = getRoleLevel(user.role.name);
    const docLevel = getRoleLevel(document.access_level);
    return userLevel <= docLevel;
  };



  // Only VP and above can create documents
  const canUpload = user?.role && user.role.level <= 3;

  const canDeleteDocument = (document: Document) => {
    if (!user?.role) return false;

    // Administrator can delete all documents
    if (user.role.name === "Administrator") return true;

    // Senior VP can delete all documents (role above VP)
    if (user.role.name === "Senior VP") return true;

    // VP can only delete documents from their department or that they uploaded
    if (user.role.name === "VP") {
      return (
        document.department === user.department ||
        document.uploaded_by === user.id
      );
    }

    // Officer and Employee cannot delete documents
    return false;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAccessLevelChange = (accessLevel: string, checked: boolean) => {
    let updatedAccessLevels = [...newDocument.access_levels];

    if (checked) {
      if (!updatedAccessLevels.includes(accessLevel)) {
        updatedAccessLevels.push(accessLevel);
      }
    } else {
      updatedAccessLevels = updatedAccessLevels.filter(
        (level) => level !== accessLevel
      );
    }

    // Update single access_level for backward compatibility (use the highest level)
    const levelHierarchy = ["Employee", "Officer", "VP", "Senior VP"];
    const highestLevel =
      levelHierarchy
        .filter((level) => updatedAccessLevels.includes(level))
        .pop() || "Employee";

    setNewDocument({
      ...newDocument,
      access_levels: updatedAccessLevels,
      access_level: highestLevel as Document["access_level"],
    });
  };

  const handleDepartmentChange = (departmentName: string, checked: boolean) => {
    if (departmentName === "All") {
      // If "All" is selected, clear other selections and set only "All"
      if (checked) {
        setNewDocument({
          ...newDocument,
          departments: ["All"],
          department: "All", // Update single department field too
        });
      } else {
        setNewDocument({
          ...newDocument,
          departments: [],
          department: "",
        });
      }
    } else {
      // If a specific department is selected
      let updatedDepartments = [...newDocument.departments];

      // Remove "All" if it exists when selecting specific departments
      updatedDepartments = updatedDepartments.filter((dept) => dept !== "All");

      if (checked) {
        updatedDepartments.push(departmentName);
      } else {
        updatedDepartments = updatedDepartments.filter(
          (dept) => dept !== departmentName
        );
      }

      setNewDocument({
        ...newDocument,
        departments: updatedDepartments,
        department: updatedDepartments.includes("All")
          ? "All"
          : updatedDepartments.join(", "), // Update single field for backward compatibility
      });
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !user) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("accessLevel", newDocument.access_level);
    formData.append("department", newDocument.department || user.department);

    // Send departments data if available
    const departmentData =
      newDocument.departments.length > 0
        ? newDocument.departments
        : [newDocument.department || user.department || "All"];
    formData.append("departments", JSON.stringify(departmentData));

    // Send access levels data if available
    const accessLevelsData =
      newDocument.access_levels.length > 0
        ? newDocument.access_levels
        : [newDocument.access_level];
    formData.append("accessLevels", JSON.stringify(accessLevelsData));

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.id) {
        setDocuments([data, ...documents]);
        setSelectedFile(null);
        setUploadDialog(false);
        // Reset form
        setNewDocument({
          access_level: "Employee",
          access_levels: [],
          department: user?.department || "",
          departments: [],
        });
      }
    } catch {
      console.error("Error uploading document");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    // Find the document to check permissions
    const document = documents.find((doc) => doc.id === id);
    if (!document || !canDeleteDocument(document)) return;

    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.id !== id));
      }
    } catch {
      console.error("Error deleting document");
    }
  };

  const accessibleDocuments = documents.filter((doc) => canAccessDocument(doc));

  // Add debugging for accessible documents
  useEffect(() => {
    console.log("Total documents:", documents.length);
    console.log("Accessible documents:", accessibleDocuments.length);
    if (documents.length > 0) {
      console.log("All documents:", documents);
      console.log("Accessible documents:", accessibleDocuments);
    }
  }, [documents, accessibleDocuments]);

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Center</h2>
          <p className="text-muted-foreground">
            Manage and share documents with role-based access
          </p>
        </div>
        {canUpload && (
          <Dialog
            open={uploadDialog}
            onOpenChange={(open) => {
              setUploadDialog(open);
              if (open) {
                // Reset form when dialog opens
                setNewDocument({
                  access_level: "Employee",
                  access_levels: [],
                  department: user?.department || "",
                  departments: [],
                });
                setSelectedFile(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Share a document with your team
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Access Level:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {newDocument.access_levels.length > 0
                            ? `${newDocument.access_levels.length} level${
                                newDocument.access_levels.length > 1 ? "s" : ""
                              } selected`
                            : "Select Access Levels"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <div className="p-3 space-y-2">
                          {["Employee", "Officer", "VP", "Senior VP"].map(
                            (level) => (
                              <div
                                key={level}
                                className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded"
                              >
                                <Checkbox
                                  id={`access-${level}`}
                                  checked={newDocument.access_levels.includes(
                                    level
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleAccessLevelChange(
                                      level,
                                      checked as boolean
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`access-${level}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {level} Access
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {newDocument.access_levels.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground font-medium">
                          Selected Access Levels:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {newDocument.access_levels.map((level) => (
                            <Badge
                              key={level}
                              variant="secondary"
                              className="text-xs"
                            >
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Target Departments:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border rounded-md">
                      {/* All Departments Option */}
                      <div className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                        <Checkbox
                          id="doc-dept-all"
                          checked={newDocument.departments.includes("All")}
                          onCheckedChange={(checked) =>
                            handleDepartmentChange("All", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="doc-dept-all"
                          className="text-sm font-medium text-primary cursor-pointer flex-1"
                        >
                          All Departments
                        </label>
                      </div>

                      {/* Individual Department Options */}
                      {departments.map((dept) => (
                        <div
                          key={dept.id}
                          className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded"
                        >
                          <Checkbox
                            id={`doc-dept-${dept.id}`}
                            checked={newDocument.departments.includes(
                              dept.name
                            )}
                            onCheckedChange={(checked) =>
                              handleDepartmentChange(
                                dept.name,
                                checked as boolean
                              )
                            }
                            disabled={newDocument.departments.includes("All")}
                          />
                          <label
                            htmlFor={`doc-dept-${dept.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {dept.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {newDocument.departments.length > 0 && (
                      <div className="space-y-3 mt-3">
                        <span className="text-sm text-muted-foreground font-medium">
                          Selected Departments:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {newDocument.departments.map((dept) => (
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
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUploadDocument} disabled={!selectedFile}>
                  Upload Document
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Documents
                </p>
                <p className="text-2xl font-bold">
                  {accessibleDocuments.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Shared
                </p>
                <p className="text-2xl font-bold">
                  {accessibleDocuments.filter((d) => d.shared).length}
                </p>
              </div>
              <Share2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Views
                </p>
                <p className="text-2xl font-bold">
                  {accessibleDocuments.reduce((sum, d) => sum + d.views, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Downloads
                </p>
                <p className="text-2xl font-bold">
                  {accessibleDocuments.reduce((sum, d) => sum + d.downloads, 0)}
                </p>
              </div>
              <Download className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {accessibleDocuments.map((document) => {
          const FileIcon = getFileIcon(document.type);
          return (
            <Card
              key={document.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{document.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {document.uploaded_by_user?.name ||
                            document.uploaded_by}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(document.created_at).toLocaleDateString()}
                        </span>
                        <span>{document.size}</span>
                        <span>
                          {document.departments &&
                          document.departments.length > 0
                            ? document.departments.join(", ")
                            : document.department || "All Departments"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={getAccessLevelColor(document.access_level)}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        {document.access_level}
                      </Badge>
                      {document.shared && (
                        <Badge variant="outline">
                          <Share2 className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{document.views}</span>
                      <Download className="h-4 w-4 ml-2" />
                      <span>{document.downloads}</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        {canDeleteDocument(document) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Document
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this document?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteDocument(document.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
