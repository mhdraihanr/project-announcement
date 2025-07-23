import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get analytics data from the view
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("document_analytics")
      .select("*")
      .order("created_at", { ascending: false });

    // Get total users first (needed for both analytics and fallback)
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      // Continue with 0 users if error
    }

    const totalUsers = users?.length || 0;

    if (analyticsError) {
      console.error("Error fetching document analytics:", analyticsError);
      // Fallback to basic documents if analytics view doesn't exist
      const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("id, name, created_at, reads, downloads")
        .order("created_at", { ascending: false });

      if (documentsError) {
        throw documentsError;
      }

      // Use basic data without analytics
      const totalDocuments = documents?.length || 0;
      const totalReads =
        documents?.reduce((sum, doc) => sum + (doc.reads || 0), 0) || 0;
      const totalDownloads =
        documents?.reduce((sum, doc) => sum + (doc.downloads || 0), 0) || 0;

      return NextResponse.json({
        overview: {
          totalDocuments,
          totalUsers,
          totalReads,
          totalDownloads,
          averageReads:
            totalDocuments > 0 ? Math.round(totalReads / totalDocuments) : 0,
          averageDownloads:
            totalDocuments > 0
              ? Math.round(totalDownloads / totalDocuments)
              : 0,
          totalRead: totalReads,
          totalNotRead: Math.max(0, totalUsers * totalDocuments - totalReads),
          totalDownloaded: totalDownloads,
          totalNotDownloaded: Math.max(
            0,
            totalUsers * totalDocuments - totalDownloads
          ),
          overallReadPercentage:
            totalUsers > 0 && totalDocuments > 0
              ? Math.round((totalReads / (totalUsers * totalDocuments)) * 100)
              : 0,
          overallDownloadPercentage:
            totalUsers > 0 && totalDocuments > 0
              ? Math.round(
                  (totalDownloads / (totalUsers * totalDocuments)) * 100
                )
              : 0,
        },
        recentDocuments:
          documents?.slice(0, 10).map((doc) => ({
            id: doc.id,
            title: doc.name,
            readCount: doc.reads || 0,
            downloadCount: doc.downloads || 0,
            readPercentage:
              totalUsers > 0
                ? Math.round(((doc.reads || 0) / totalUsers) * 100)
                : 0,
            downloadPercentage:
              totalUsers > 0
                ? Math.round(((doc.downloads || 0) / totalUsers) * 100)
                : 0,
            createdAt: doc.created_at,
          })) || [],
        monthlyTrend: [],
        documentTypes: [],
      });
    }

    // totalUsers already fetched above
    const totalDocuments = analyticsData?.length || 0;
    const totalReads =
      analyticsData?.reduce((sum, doc) => sum + (doc.read_count || 0), 0) || 0;
    const totalDownloads =
      analyticsData?.reduce((sum, doc) => sum + (doc.download_count || 0), 0) ||
      0;
    const averageReads =
      totalDocuments > 0 ? Math.round(totalReads / totalDocuments) : 0;
    const averageDownloads =
      totalDocuments > 0 ? Math.round(totalDownloads / totalDocuments) : 0;

    // Use analytics data with proper statistics
    const documentStats =
      analyticsData?.map((document) => {
        const readCount = document.read_count || 0;
        const downloadedCount = document.download_count || 0;
        const readPercentage =
          totalUsers > 0 ? Math.round((readCount / totalUsers) * 100) : 0;
        const downloadPercentage =
          totalUsers > 0 ? Math.round((downloadedCount / totalUsers) * 100) : 0;

        return {
          id: document.id,
          title: document.title,
          readCount,
          downloadCount: document.download_count || 0,
          notReadCount: Math.max(0, totalUsers - readCount),
          downloadedCount,
          notDownloadedCount: Math.max(0, totalUsers - downloadedCount),
          readPercentage,
          downloadPercentage,
          createdAt: document.created_at,
        };
      }) || [];

    // Get recent documents performance
    const recentDocuments = documentStats.slice(0, 10);

    // Calculate overall statistics
    const totalRead = documentStats.reduce(
      (sum, stat) => sum + stat.readCount,
      0
    );
    const totalNotRead = documentStats.reduce(
      (sum, stat) => sum + stat.notReadCount,
      0
    );
    const totalDownloaded = documentStats.reduce(
      (sum, stat) => sum + stat.downloadedCount,
      0
    );
    const totalNotDownloaded = documentStats.reduce(
      (sum, stat) => sum + stat.notDownloadedCount,
      0
    );

    const overallReadPercentage =
      totalUsers > 0 && totalDocuments > 0
        ? Math.round((totalRead / (totalUsers * totalDocuments)) * 100)
        : 0;
    const overallDownloadPercentage =
      totalUsers > 0 && totalDocuments > 0
        ? Math.round((totalDownloaded / (totalUsers * totalDocuments)) * 100)
        : 0;

    // Monthly trend data (mock data for now)
    const monthlyTrend = [
      {
        month: "Jan",
        documents: 8,
        totalReads: 320,
        totalDownloads: 180,
        averageReadRate: 80,
        averageDownloadRate: 45,
      },
      {
        month: "Feb",
        documents: 12,
        totalReads: 480,
        totalDownloads: 240,
        averageReadRate: 80,
        averageDownloadRate: 40,
      },
      {
        month: "Mar",
        documents: 10,
        totalReads: 450,
        totalDownloads: 270,
        averageReadRate: 90,
        averageDownloadRate: 54,
      },
      {
        month: "Apr",
        documents: 15,
        totalReads: 600,
        totalDownloads: 360,
        averageReadRate: 80,
        averageDownloadRate: 48,
      },
      {
        month: "May",
        documents: 11,
        totalReads: 550,
        totalDownloads: 330,
        averageReadRate: 100,
        averageDownloadRate: 60,
      },
      {
        month: "Jun",
        documents: totalDocuments,
        totalReads: totalReads,
        totalDownloads: totalDownloads,
        averageReadRate: overallReadPercentage,
        averageDownloadRate: overallDownloadPercentage,
      },
    ];

    // Document type distribution (mock data)
    const documentTypes = [
      { type: "PDF", count: Math.floor(totalDocuments * 0.6), percentage: 60 },
      {
        type: "Word",
        count: Math.floor(totalDocuments * 0.25),
        percentage: 25,
      },
      {
        type: "Excel",
        count: Math.floor(totalDocuments * 0.1),
        percentage: 10,
      },
      {
        type: "PowerPoint",
        count: Math.floor(totalDocuments * 0.05),
        percentage: 5,
      },
    ];

    return NextResponse.json({
      overview: {
        totalDocuments,
        totalUsers,
        totalReads,
        totalDownloads,
        averageReads,
        averageDownloads,
        totalRead,
        totalNotRead,
        totalDownloaded,
        totalNotDownloaded,
        overallReadPercentage,
        overallDownloadPercentage,
      },
      recentDocuments,
      monthlyTrend,
      documentTypes,
      documentStats,
    });
  } catch (error) {
    console.error("Error fetching document analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch document analytics" },
      { status: 500 }
    );
  }
}
