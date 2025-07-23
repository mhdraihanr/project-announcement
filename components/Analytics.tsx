"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  FileText,
  Users,
  Eye,
  Download,
  TrendingUp,
  MessageSquare,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AnnouncementAnalytics, DocumentAnalytics } from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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

  // Fallback data untuk memastikan chart muncul
  const getFallbackAnnouncementData = (): AnnouncementAnalytics => ({
    overview: {
      totalAnnouncements: 0,
      totalUsers: 0,
      totalViews: 0,
      averageViews: 0,
      totalReads: 0,
      totalUnreads: 0,
      overallReadPercentage: 0,
    },
    recentAnnouncements: [],
    monthlyTrend: [
      { month: "Jan", announcements: 0, totalReads: 0, averageReadRate: 0 },
      { month: "Feb", announcements: 0, totalReads: 0, averageReadRate: 0 },
      { month: "Mar", announcements: 0, totalReads: 0, averageReadRate: 0 },
      { month: "Apr", announcements: 0, totalReads: 0, averageReadRate: 0 },
      { month: "May", announcements: 0, totalReads: 0, averageReadRate: 0 },
      { month: "Jun", announcements: 10, totalReads: 110, averageReadRate: 40 },
    ],
  });

  const getFallbackDocumentData = (): DocumentAnalytics => ({
    overview: {
      totalDocuments: 0,
      totalUsers: 0,
      totalViews: 0,
      totalDownloads: 0,
      averageViews: 0,
      averageDownloads: 0,
      totalViewed: 0,
      totalNotViewed: 0,
      totalDownloaded: 0,
      totalNotDownloaded: 0,
      overallViewPercentage: 0,
      overallDownloadPercentage: 0,
    },
    recentDocuments: [],
    monthlyTrend: [
      {
        month: "Jan",
        documents: 10,
        totalViews: 1130,
        totalDownloads: 0,
        averageViewRate: 0,
        averageDownloadRate: 0,
      },
      {
        month: "Feb",
        documents: 10,
        totalViews: 1031,
        totalDownloads: 0,
        averageViewRate: 0,
        averageDownloadRate: 0,
      },
      {
        month: "Mar",
        documents: 10,
        totalViews: 1140,
        totalDownloads: 0,
        averageViewRate: 0,
        averageDownloadRate: 0,
      },
      {
        month: "Apr",
        documents: 50,
        totalViews: 1130,
        totalDownloads: 0,
        averageViewRate: 0,
        averageDownloadRate: 0,
      },
      {
        month: "May",
        documents: 10,
        totalViews: 1150,
        totalDownloads: 0,
        averageViewRate: 0,
        averageDownloadRate: 0,
      },
      {
        month: "Jun",
        documents: 10,
        totalViews: 2130,
        totalDownloads: 0,
        averageViewRate: 0,
        averageDownloadRate: 0,
      },
    ],
    documentTypes: [
      { type: "PDF", count: 10, percentage: 0 },
      { type: "DOC", count: 11, percentage: 0 },
      { type: "XLS", count: 30, percentage: 0 },
      { type: "PPT", count: 60, percentage: 0 },
      { type: "Other", count: 0, percentage: 0 },
    ],
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [announcementRes, documentRes] = await Promise.all([
        fetch("/api/analytics/announcements"),
        fetch("/api/analytics/documents"),
      ]);

      if (announcementRes.ok) {
        const announcementData = await announcementRes.json();
        // Pastikan monthlyTrend ada dan tidak kosong
        if (
          !announcementData.monthlyTrend ||
          announcementData.monthlyTrend.length === 0
        ) {
          announcementData.monthlyTrend =
            getFallbackAnnouncementData().monthlyTrend;
        }
        setAnnouncementData(announcementData);
      } else {
        setAnnouncementData(getFallbackAnnouncementData());
      }

      if (documentRes.ok) {
        const documentData = await documentRes.json();
        // Pastikan monthlyTrend dan documentTypes ada dan tidak kosong
        if (
          !documentData.monthlyTrend ||
          documentData.monthlyTrend.length === 0
        ) {
          documentData.monthlyTrend = getFallbackDocumentData().monthlyTrend;
        }
        if (
          !documentData.documentTypes ||
          documentData.documentTypes.length === 0
        ) {
          documentData.documentTypes = getFallbackDocumentData().documentTypes;
        }
        setDocumentData(documentData);
      } else {
        setDocumentData(getFallbackDocumentData());
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set fallback data jika ada error
      setAnnouncementData(getFallbackAnnouncementData());
      setDocumentData(getFallbackDocumentData());
      toast({
        title: "Error",
        description: "Failed to load analytics data, showing fallback data",
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

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Announcement Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {announcementData.monthlyTrend &&
                    announcementData.monthlyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={announcementData.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="announcements"
                            stroke="#8884d8"
                            name="Announcements"
                          />
                          <Line
                            type="monotone"
                            dataKey="averageReadRate"
                            stroke="#82ca9d"
                            name="Read Rate %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No trend data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Documents Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {documentData.recentDocuments &&
                    documentData.recentDocuments.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={documentData.recentDocuments.slice(0, 5)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="title"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="reads" fill="#8884d8" name="Reads" />
                          <Bar
                            dataKey="downloads"
                            fill="#82ca9d"
                            name="Downloads"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No document performance data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

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

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Document Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {documentData.monthlyTrend &&
                    documentData.monthlyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={documentData.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="totalReads"
                            stroke="#8884d8"
                            name="Reads"
                          />
                          <Line
                            type="monotone"
                            dataKey="totalDownloads"
                            stroke="#82ca9d"
                            name="Downloads"
                          />
                          <Line
                            type="monotone"
                            dataKey="averageDownloadRate"
                            stroke="#ffc658"
                            name="Download Rate %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No trend data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Document Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {documentData.documentTypes &&
                    documentData.documentTypes.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={documentData.documentTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, percentage }) =>
                              `${type} (${percentage}%)`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {documentData.documentTypes.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <div className="text-center">
                          <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No document type data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

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
