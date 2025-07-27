"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  Eye,
  Download,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AnnouncementAnalytics, DocumentAnalytics } from "@/types";



export default function Analytics() {
  const [announcementData, setAnnouncementData] =
    useState<AnnouncementAnalytics | null>(null);
  const [documentData, setDocumentData] = useState<DocumentAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);



  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [announcementRes, documentRes] = await Promise.all([
        fetch("/api/analytics/announcements"),
        fetch("/api/analytics/documents"),
      ]);

      if (announcementRes.ok) {
        const announcementData = await announcementRes.json();
        setAnnouncementData(announcementData);
      }

      if (documentRes.ok) {
        const documentData = await documentRes.json();
        setDocumentData(documentData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h2>
        <p className="text-muted-foreground">
          Monitor user engagement with announcements and documents
        </p>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          {announcementData && (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Announcements
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {announcementData.overview.totalAnnouncements}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active announcements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Reads
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {announcementData.overview.totalReads}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg {announcementData.overview.averageReads} per
                      announcement
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Read Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {announcementData.overview.overallReadPercentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall engagement rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {announcementData.overview.totalUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Registered users
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* User Read Status */}
              <Card>
                <CardHeader>
                  <CardTitle>User Read Status</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Status membaca announcements per user
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcementData.userReadStatus &&
                    announcementData.userReadStatus.length > 0 ? (
                      announcementData.userReadStatus.map((user) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{user.userName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {user.userRole} - {user.userDepartment}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <div className="text-center">
                                <div className="text-sm font-medium">
                                  {user.readAnnouncements}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Read
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <div className="text-center">
                                <div className="text-sm font-medium">
                                  {user.unreadAnnouncements}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Unread
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        <div className="text-center">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No user read status data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Announcements Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcementData.recentAnnouncements
                      .slice(0, 10)
                      .map((announcement) => (
                        <div
                          key={announcement.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {announcement.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                announcement.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {announcement.readCount}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reads
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {announcement.unreadCount}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Unread
                              </div>
                            </div>
                            <Badge
                              variant={
                                announcement.readPercentage > 70
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {announcement.readPercentage}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {documentData && (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Documents
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {documentData.overview.totalDocuments}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available documents
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Reads
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {documentData.overview.totalReads}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg {documentData.overview.averageReads} per document
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Downloads
                    </CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {documentData.overview.totalDownloads}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg {documentData.overview.averageDownloads} per document
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Download Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {documentData.overview.overallDownloadPercentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall download rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* User Document Read Status */}
              <Card>
                <CardHeader>
                  <CardTitle>User Document Status</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Status membaca dan download documents per user
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documentData.userReadStatus &&
                    documentData.userReadStatus.length > 0 ? (
                      documentData.userReadStatus.map((user) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{user.userName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {user.userRole} - {user.userDepartment}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-blue-500" />
                              <div className="text-center">
                                <div className="text-sm font-medium">
                                  {user.readDocuments}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Read
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <div className="text-center">
                                <div className="text-sm font-medium">
                                  {user.unreadDocuments}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Unread
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Download className="h-4 w-4 text-green-500" />
                              <div className="text-center">
                                <div className="text-sm font-medium">
                                  {user.downloadedDocuments}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Downloaded
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        <div className="text-center">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No user document status data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Documents Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Documents Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documentData.recentDocuments
                      .slice(0, 10)
                      .map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{document.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                document.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {document.readCount}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Reads
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {document.downloadCount}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Downloads
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge
                                variant={
                                  document.readPercentage > 70
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {document.readPercentage}% viewed
                              </Badge>
                              <Badge
                                variant={
                                  document.downloadPercentage > 50
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {document.downloadPercentage}% downloaded
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
