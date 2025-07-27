import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Date filter for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get all announcements from the last 6 months
    const { data: announcements, error: announcementsError } = await supabase
      .from("announcements")
      .select("id, title, created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: false });

    if (announcementsError) {
      console.error("Error fetching announcements:", announcementsError);
      throw announcementsError;
    }

    // Get all announcement reads
    const { data: announcementReads, error: readsError } = await supabase
      .from("announcement_reads")
      .select("announcement_id, user_id, is_read");

    if (readsError) {
      console.error("Error fetching announcement reads:", readsError);
      throw readsError;
    }

    // Get total registered users with details
    const { data: users, error: usersError } = await supabase.from("users")
      .select(`
        id,
        name,
        department,
        role:roles(name)
      `);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    // Calculate overview statistics
    const totalAnnouncements = announcements?.length || 0;
    const totalUsers = users?.length || 0;
    const uniqueInteractedUsers = new Set(
      announcementReads?.map((r) => r.user_id) || []
    ).size;
    const totalReads =
      announcementReads?.filter((r) => r.is_read === true).length || 0;
    const totalUnreads =
      announcementReads?.filter(
        (r) => r.is_read === false || r.is_read === null
      ).length || 0;
    const averageReads =
      totalAnnouncements > 0 ? totalReads / totalAnnouncements : 0;
    const overallReadPercentage =
      totalUsers > 0
        ? (totalReads / (totalUsers * totalAnnouncements)) * 100
        : 0;

    // Calculate recent announcements with read counts
    const recentAnnouncements =
      announcements?.slice(0, 10).map((announcement) => {
        const reads =
          announcementReads?.filter(
            (r) => r.announcement_id === announcement.id
          ) || [];
        const readCount = reads.filter((r) => r.is_read === true).length;
        const unreadCount = Math.max(0, totalUsers - readCount);
        const readPercentage =
          totalUsers > 0 ? Math.round((readCount / totalUsers) * 100) : 0;

        return {
          id: announcement.id,
          title: announcement.title,
          readCount,
          unreadCount,
          readPercentage,
          createdAt: announcement.created_at,
        };
      }) || [];

    // Calculate monthly trends
    const monthlyTrend = [];
    const monthlyData = new Map();

    announcements?.forEach((announcement) => {
      const month = new Date(announcement.created_at)
        .toISOString()
        .substring(0, 7); // YYYY-MM format
      const reads =
        announcementReads?.filter(
          (r) => r.announcement_id === announcement.id
        ) || [];
      const readCount = reads.filter((r) => r.is_read === true).length;
      const unreadCount = reads.filter(
        (r) => r.is_read === false || r.is_read === null
      ).length;

      if (!monthlyData.has(month)) {
        monthlyData.set(month, { totalReads: 0, totalUnread: 0 });
      }

      const current = monthlyData.get(month);
      current.totalReads += readCount;
      current.totalUnread += unreadCount;
    });

    for (const [month, data] of monthlyData.entries()) {
      const averageReadRate =
        data.totalReads + data.totalUnread > 0
          ? Math.round(
              (data.totalReads / (data.totalReads + data.totalUnread)) * 100
            )
          : 0;

      monthlyTrend.push({
        month,
        totalReads: data.totalReads,
        totalUnread: data.totalUnread,
        averageReadRate,
      });
    }

    monthlyTrend.sort((a, b) => a.month.localeCompare(b.month));

    // Calculate user read status
    const userReadStatus =
      users?.map((user) => {
        const userReads =
          announcementReads?.filter((r) => r.user_id === user.id) || [];
        const readAnnouncements = userReads.filter(
          (r) => r.is_read === true
        ).length;
        const unreadAnnouncements = Math.max(
          0,
          totalAnnouncements - readAnnouncements
        );

        return {
          userId: user.id,
          userName: user.name || "Unknown User",
          userRole: user.role?.[0]?.name || "Unknown Role",
          userDepartment: user.department || "Unknown Department",
          readAnnouncements,
          unreadAnnouncements,
        };
      }) || [];

    return NextResponse.json({
      overview: {
        totalAnnouncements,
        totalUsers,
        totalReads,
        averageReads: Math.round(averageReads * 100) / 100,
        totalUnreads,
        overallReadPercentage: Math.round(overallReadPercentage * 100) / 100,
      },
      recentAnnouncements,
      monthlyTrend,
      userReadStatus,
    });
  } catch (error) {
    console.error("Error fetching announcement analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement analytics" },
      { status: 500 }
    );
  }
}
