"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, TrendingUp } from "lucide-react";
import {
  stats,
  quickActions,
  recentActivities,
  latestAnnouncements,
} from "@/types/data";
import { useUser } from "@/components/providers/user-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Only show loading on initial load, not on subsequent auth state changes
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground text-lg">Loading...</span>
      </div>
    );
  }

  // Jika user null (sudah dicek di useEffect), return null agar tidak flicker
  if (!user) return null;

  // Jika user sudah ada, langsung render dashboard
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      <p className="text-muted-foreground">Role: {user.role?.name}</p>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts for your daily workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent"
                onClick={action.action}
              >
                <action.icon className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.file}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestAnnouncements.map((announcement, index) => (
              <div key={index} className="p-3 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{announcement.title}</p>
                      <Badge
                        variant={
                          announcement.priority === "high"
                            ? "destructive"
                            : announcement.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {announcement.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {announcement.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
