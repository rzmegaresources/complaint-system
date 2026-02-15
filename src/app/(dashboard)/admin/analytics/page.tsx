"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,

  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Ticket,

} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AnalyticsData {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  criticalTickets: number;
  byPriority: { priority: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("[ANALYTICS]", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          System-wide complaint trends and performance metrics
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tickets"
          value={data.totalTickets}
          icon={<Ticket className="w-5 h-5 text-blue-500" />}
          bg="bg-blue-50"
        />
        <StatCard
          label="Open"
          value={data.openTickets}
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
          bg="bg-yellow-50"
        />
        <StatCard
          label="Resolved"
          value={data.resolvedTickets}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          bg="bg-green-50"
        />
        <StatCard
          label="Critical"
          value={data.criticalTickets}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          bg="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Priority */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Tickets by Priority
          </h3>
          <div className="space-y-3">
            {data.byPriority.map((item) => {
              const maxCount = Math.max(...data.byPriority.map((p) => p.count), 1);
              const pct = (item.count / maxCount) * 100;
              const colors: Record<string, string> = {
                CRITICAL: "bg-red-500",
                HIGH: "bg-orange-500",
                MEDIUM: "bg-yellow-500",
                LOW: "bg-green-500",
              };
              return (
                <div key={item.priority}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      {item.priority}
                    </span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        colors[item.priority] || "bg-slate-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Tickets by Status
          </h3>
          <div className="space-y-3">
            {data.byStatus.map((item) => {
              const maxCount = Math.max(...data.byStatus.map((s) => s.count), 1);
              const pct = (item.count / maxCount) * 100;
              const colors: Record<string, string> = {
                OPEN: "bg-blue-500",
                IN_PROGRESS: "bg-purple-500",
                RESOLVED: "bg-green-500",
                REJECTED: "bg-red-500",
              };
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">
                      {item.status.replace("_", " ")}
                    </span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        colors[item.status] || "bg-slate-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Top Categories
          </h3>
          {data.byCategory.length === 0 ? (
            <p className="text-sm text-slate-400">No categories yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.byCategory.map((item) => (
                <div
                  key={item.category}
                  className="bg-slate-50 rounded-xl p-4 text-center"
                >
                  <p className="text-2xl font-bold text-slate-900">
                    {item.count}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.category}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
