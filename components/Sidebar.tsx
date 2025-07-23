"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  MessageCircle,
  Calendar,
  Bell,
  Users,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react";
import { useUser } from "@/components/providers/user-provider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // Only show admin/analytics for roles other than Employee and Officer
  const isEmployeeOrOfficer =
    user?.role?.name === "Employee" || user?.role?.name === "Officer";

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const navigation = [
    {
      name: "Dashboard",
      icon: Home,
      href: "/dashboard",
      badge: undefined,
      show: true,
    },
    {
      name: "Announcements",
      icon: Bell,
      href: "/announcements",
      badge: "3",
      show: true,
    },
    {
      name: "Documents",
      icon: FileText,
      href: "/documents",
      badge: undefined,
      show: true,
    },
    {
      name: "Chat",
      icon: MessageCircle,
      href: "/chat",
      badge: "5",
      show: true,
    },
    {
      name: "Calendar",
      icon: Calendar,
      href: "/calendar",
      badge: undefined,
      show: true,
    },
    {
      name: "Officer",
      icon: Users,
      href: "/officer",
      badge: undefined,
      show: true,
    },
    {
      name: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      badge: undefined,
      show: !isEmployeeOrOfficer,
    },
    {
      name: "Admin Panel",
      icon: Shield,
      href: "/admin",
      badge: undefined,
      show: !isEmployeeOrOfficer,
    },
    {
      name: "Settings",
      icon: Settings,
      href: "/settings",
      badge: undefined,
      show: true,
    },
  ];

  return (
    <>
      {/* Overlay for mobile only */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 lg:hidden z-10 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-[64px] left-0 z-30 h-[calc(100vh-64px)] w-64 bg-background border-r flex flex-col transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-xl">TI</span>
            </div>
            <h2 className="font-semibold text-foreground">Departemen TI</h2>
            <p className="text-sm text-muted-foreground">
              Collaborative Workspace
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
        </nav>

        <div className="p-4 border-t">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium text-foreground">Need Help?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Contact IT support for assistance
            </p>
            <Button size="sm" variant="outline" className="w-full mt-2">
              Get Support
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
