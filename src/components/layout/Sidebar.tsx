"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");
  const isHR = pathname?.startsWith("/hr");

  const adminLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      label: "All Tickets",
      href: "/admin",
      icon: Ticket,
      active: false,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Document Vault",
      href: "/admin/documents",
      icon: BookOpen,
      active: pathname === "/admin/documents",
      gradient: "from-violet-500 to-fuchsia-500",
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      active: pathname === "/admin/analytics",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const hrLinks = [
    {
      label: "Users",
      href: "/hr",
      icon: LayoutDashboard,
      active: pathname === "/hr",
      gradient: "from-teal-500 to-emerald-500",
    },
  ];

  const userLinks = [
    {
      label: "Submit Complaint",
      href: "/user",
      icon: MessageSquare,
      active: pathname === "/user",
      gradient: "from-blue-500 to-indigo-600",
    },
  ];

  const links = isAdmin ? adminLinks : isHR ? hrLinks : userLinks;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col",
        "bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">
                VoiceBox
              </span>
              <p className="text-[10px] text-indigo-300/70 -mt-0.5">
                Complaint System
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {collapsed ? (
            <Menu className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
              isAdmin
                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                : isHR
                ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/30"
                : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30"
            )}
          >
            {isAdmin ? "👑 Admin" : isHR ? "🧑‍💼 HR" : "👤 User"}
          </span>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
              link.active
                ? `bg-gradient-to-r ${link.gradient} text-white shadow-lg shadow-indigo-900/30`
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon
              className={cn(
                "w-5 h-5 transition-colors shrink-0",
                link.active
                  ? "text-white"
                  : "text-slate-400 group-hover:text-white"
              )}
            />
            {!collapsed && (
              <span className="font-medium text-sm">{link.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/login"
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/15 hover:text-red-400 text-slate-400 transition-all group"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}
