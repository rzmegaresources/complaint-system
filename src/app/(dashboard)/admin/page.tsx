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
  TrendingUp,
  Sparkles,
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

const priorityConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; gradient: string }> = {
  CRITICAL: {
    color: "text-red-700",
    bg: "bg-red-100 border-red-200",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    gradient: "from-red-500 to-rose-600",
  },
  HIGH: {
    color: "text-orange-700",
    bg: "bg-orange-100 border-orange-200",
    icon: <Flame className="w-3.5 h-3.5" />,
    gradient: "from-orange-500 to-amber-600",
  },
  MEDIUM: {
    color: "text-yellow-700",
    bg: "bg-yellow-100 border-yellow-200",
    icon: <Clock className="w-3.5 h-3.5" />,
    gradient: "from-yellow-500 to-orange-500",
  },
  LOW: {
    color: "text-emerald-700",
    bg: "bg-emerald-100 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    gradient: "from-emerald-500 to-teal-500",
  },
};

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  OPEN: { color: "text-blue-700", bg: "bg-blue-100/80", dot: "bg-blue-500" },
  IN_PROGRESS: { color: "text-purple-700", bg: "bg-purple-100/80", dot: "bg-purple-500" },
  RESOLVED: { color: "text-emerald-700", bg: "bg-emerald-100/80", dot: "bg-emerald-500" },
  REJECTED: { color: "text-red-700", bg: "bg-red-100/80", dot: "bg-red-500" },
};

const sentimentConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  ANGRY: { icon: <XCircle className="w-3.5 h-3.5" />, label: "Angry", color: "text-red-600 bg-red-50 border-red-100" },
  NEUTRAL: { icon: <Meh className="w-3.5 h-3.5" />, label: "Neutral", color: "text-slate-600 bg-slate-50 border-slate-100" },
  CALM: { icon: <SmilePlus className="w-3.5 h-3.5" />, label: "Calm", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
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

  const stats = {
    total: tickets.length,
    critical: tickets.filter((t) => t.priority === "CRITICAL").length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Admin Dashboard
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            VoiceBox Complaint Management — Overview of all complaints
          </p>
        </div>
      </div>

      {/* Stat Cards - Vibrant Gradient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientStatCard
          label="Total Tickets"
          value={stats.total}
          icon={<Ticket className="w-6 h-6" />}
          gradient="stat-card-blue"
          trend="+12%"
        />
        <GradientStatCard
          label="Critical"
          value={stats.critical}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="stat-card-red"
        />
        <GradientStatCard
          label="Open"
          value={stats.open}
          icon={<Clock className="w-6 h-6" />}
          gradient="stat-card-amber"
        />
        <GradientStatCard
          label="Resolved"
          value={stats.resolved}
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="stat-card-emerald"
          trend="✓"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/50">
        {[
          { key: "ALL", label: "All", color: "from-indigo-500 to-purple-600" },
          { key: "CRITICAL", label: "Critical", color: "from-red-500 to-rose-600" },
          { key: "HIGH", label: "High", color: "from-orange-500 to-amber-600" },
          { key: "MEDIUM", label: "Medium", color: "from-yellow-500 to-orange-500" },
          { key: "LOW", label: "Low", color: "from-emerald-500 to-teal-600" },
        ].map((level) => (
          <button
            key={level.key}
            onClick={() => setFilter(level.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              filter === level.key
                ? `bg-gradient-to-r ${level.color} text-white shadow-lg`
                : "bg-transparent text-slate-600 hover:bg-white hover:shadow-sm"
            )}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* Ticket Cards Grid */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
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
                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200/60 transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Gradient top accent bar */}
                <div className={cn("h-1 w-full rounded-full bg-gradient-to-r mb-4", priority.gradient)} />

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
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      status.bg,
                      status.color
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                  {ticket.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {ticket.description}
                </p>

                {/* AI Badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {ticket.aiAnalysis?.category && (
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-100">
                      🏷 {ticket.aiAnalysis.category}
                    </span>
                  )}
                  {sentiment && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium border",
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
                    href={`/admin/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
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

// Gradient stat card sub-component
function GradientStatCard({
  label,
  value,
  icon,
  gradient,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  trend?: string;
}) {
  return (
    <div className={cn("rounded-2xl p-5 text-white relative overflow-hidden shadow-lg", gradient)}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">{icon}</div>
          {trend && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm font-medium text-white/80">{label}</p>
      </div>
    </div>
  );
}
