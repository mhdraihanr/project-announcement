"use client";

import { useState } from "react";
import Image from "next/image";
import type { Notification } from "@/types";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  UserIcon,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/providers/theme-provider";
import { useUser } from "@/components/providers/user-provider";

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const { setTheme } = useTheme();
  const { user, signOut } = useUser();

  const [notifications] = useState<Notification[]>([
    { id: "1", title: "New document shared", time: "5 min ago", unread: true },
    { id: "2", title: "Meeting reminder", time: "10 min ago", unread: true },
    { id: "3", title: "System update", time: "1 hour ago", unread: false },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={`fixed top-0 right-0 left-0 bg-background border-b px-4 lg:px-6 py-3 h-[64px] z-40 transition-all duration-200 ease-out ${
        isSidebarOpen ? "lg:pl-[280px]" : "pl-4"
      }`}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative p-0 h-10 w-10 flex items-center justify-center"
            onClick={onMenuClick}
            aria-label="Toggle Menu"
          >
            <div className="flex flex-col justify-center items-center w-6 space-y-1.5">
              <span
                className={`bg-foreground block transition-all duration-300 ease-out 
                h-0.5 w-6 rounded-sm ${
                  isSidebarOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`bg-foreground block transition-all duration-300 ease-out 
                h-0.5 w-6 rounded-sm ${
                  isSidebarOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`bg-foreground block transition-all duration-300 ease-out 
                h-0.5 w-6 rounded-sm ${
                  isSidebarOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </Button>

          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="PT Pupuk Kujang Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h1 className="text-xl lg:text-2xl font-bold">PT Pupuk Kujang</h1>
          </div>
          <Badge variant="outline" className="text-xs hidden sm:inline-flex">
            v2.0
          </Badge>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents, people, or announcements..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-3 p-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      notification.unread ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 p-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar_url || "/avatars/default.png"}
                    alt="User"
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role?.name || "Guest"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
