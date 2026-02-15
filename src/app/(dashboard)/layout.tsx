"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="transition-all duration-300 ml-[260px]">
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
