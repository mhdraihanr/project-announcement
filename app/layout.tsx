"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
          <UserProvider>
            {isLoginPage ? (
              <>{children}</>
            ) : (
              <div className="flex min-h-screen">
                <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
                <div
                  className={`flex-1 flex flex-col transition-all duration-200 ease-out ${
                    isSidebarOpen ? "lg:ml-64" : "ml-0"
                  }`}
                >
                  <Header
                    onMenuClick={handleToggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                  />
                  <main className="flex-1 p-6 mt-[64px]">{children}</main>
                </div>
              </div>
            )}
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
