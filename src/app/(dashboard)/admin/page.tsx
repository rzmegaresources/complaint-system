"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Flame,
  Meh,
  SmilePlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TicketData {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  aiAnalysis: {
    category?: string;
    priority?: string;
    sentiment?: string;
  } | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const priorityConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  CRITICAL: {
    color: "text-red-700",
    bg: "bg-red-100 border-red-200",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  HIGH: {
    color: "text-orange-700",
    bg: "bg-orange-100 border-orange-200",
    icon: <Flame className="w-3.5 h-3.5" />,
  },
  MEDIUM: {
    color: "text-yellow-700",
    bg: "bg-yellow-100 border-yellow-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  LOW: {
    color: "text-green-700",
    bg: "bg-green-100 border-green-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

const statusConfig: Record<string, { color: string; bg: string }> = {
  OPEN: { color: "text-blue-700", bg: "bg-blue-100" },
  IN_PROGRESS: { color: "text-purple-700", bg: "bg-purple-100" },
  RESOLVED: { color: "text-green-700", bg: "bg-green-100" },
  REJECTED: { color: "text-red-700", bg: "bg-red-100" },
};

const sentimentConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  ANGRY: { icon: <XCircle className="w-3.5 h-3.5" />, label: "Angry", color: "text-red-500 bg-red-50" },
  NEUTRAL: { icon: <Meh className="w-3.5 h-3.5" />, label: "Neutral", color: "text-slate-500 bg-slate-50" },
  CALM: { icon: <SmilePlus className="w-3.5 h-3.5" />, label: "Calm", color: "text-green-500 bg-green-50" },
};

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch("/api/tickets");
        const data = await res.json();
        setTickets(data);
      } catch (error) {
        console.error("[ADMIN_DASHBOARD]", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const filteredTickets =
    filter === "ALL"
      ? tickets
      : tickets.filter((t) => t.priority === filter);

  // Stats
  const stats = {
    total: tickets.length,
    critical: tickets.filter((t) => t.priority === "CRITICAL").length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of all complaints with AI-powered analysis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={stats.total} icon={<Ticket className="w-5 h-5 text-blue-500" />} bg="bg-blue-50" />
        <StatCard label="Critical" value={stats.critical} icon={<AlertTriangle className="w-5 h-5 text-red-500" />} bg="bg-red-50" />
        <StatCard label="Open" value={stats.open} icon={<Clock className="w-5 h-5 text-yellow-500" />} bg="bg-yellow-50" />
        <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} bg="bg-green-50" />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
              filter === level
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Ticket Cards Grid */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No tickets found</p>
          <p className="text-sm">Tickets will appear here once users submit complaints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => {
            const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
            const status = statusConfig[ticket.status] || statusConfig.OPEN;
            const sentiment = ticket.aiAnalysis?.sentiment
              ? sentimentConfig[ticket.aiAnalysis.sentiment]
              : null;

            return (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                {/* Top Row: Priority + Status */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                      priority.bg,
                      priority.color
                    )}
                  >
                    {priority.icon}
                    {ticket.priority}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      status.bg,
                      status.color
                    )}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-1">
                  {ticket.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {ticket.description}
                </p>

                {/* AI Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {ticket.aiAnalysis?.category && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                      {ticket.aiAnalysis.category}
                    </span>
                  )}
                  {sentiment && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                        sentiment.color
                      )}
                    >
                      {sentiment.icon}
                      {sentiment.label}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-400">
                    <span className="font-medium text-slate-600">
                      {ticket.user?.name || "Unknown"}
                    </span>{" "}
                    · {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                  <Link
                    href={`/(dashboard)/admin/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Stat card sub-component
function StatCard({
  label,
  value,
  icon,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div className={cn("p-3 rounded-xl", bg)}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
