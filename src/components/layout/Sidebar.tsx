"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const userLinks = [
  { href: "/(dashboard)/user", label: "Dashboard", icon: LayoutDashboard },
  { href: "/(dashboard)/user/tickets", label: "My Tickets", icon: Ticket },
  { href: "/(dashboard)/user/chat", label: "AI Chat", icon: MessageSquare },
];

const adminLinks = [
  { href: "/(dashboard)/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/(dashboard)/admin/tickets", label: "All Tickets", icon: Ticket },
  { href: "/(dashboard)/admin/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/(dashboard)/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/(dashboard)/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = pathname?.includes("/admin");
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-slate-900 border-r border-slate-800 flex flex-col",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-sm shrink-0">
          CS
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-lg tracking-tight">
            ComplaintSys
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isAdmin && !collapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Admin Panel
          </p>
        )}
        {!isAdmin && !collapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            User Portal
          </p>
        )}

        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              title={collapsed ? link.label : undefined}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-800">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
              isAdmin
                ? "bg-red-500/10 text-red-400"
                : "bg-green-500/10 text-green-400"
            )}
          >
            <Shield className="w-4 h-4" />
            {isAdmin ? "Administrator" : "User"}
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-slate-800 text-slate-500 hover:text-white transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
