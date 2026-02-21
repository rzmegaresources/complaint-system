"use client";

import { useEffect, useState, useRef } from "react";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
} as const;

// Animated number counter hook
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    startTime.current = null;
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return count;
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          System-wide complaint trends and performance metrics
        </p>
      </motion.div>

      {/* Top Stats Cards — Gradient Style */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <GradientStatCard
            label="Total Tickets"
            value={data.totalTickets}
            icon={<Ticket className="w-6 h-6" />}
            gradient="stat-card-blue"
            trend="+12%"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <GradientStatCard
            label="Open"
            value={data.openTickets}
            icon={<Clock className="w-6 h-6" />}
            gradient="stat-card-amber"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <GradientStatCard
            label="Resolved"
            value={data.resolvedTickets}
            icon={<CheckCircle2 className="w-6 h-6" />}
            gradient="stat-card-emerald"
            trend="✓"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <GradientStatCard
            label="Critical"
            value={data.criticalTickets}
            icon={<AlertTriangle className="w-6 h-6" />}
            gradient="stat-card-red"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Status Distribution */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-slate-900 mb-6">
            Tickets by Status
          </h3>
          <DonutChart data={data.byStatus} />
        </motion.div>

        {/* Animated Bar Chart: Priority */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-slate-900 mb-6">
            Tickets by Priority
          </h3>
          <div className="space-y-4">
            {data.byPriority.map((item, index) => {
              const maxCount = Math.max(...data.byPriority.map((p) => p.count), 1);
              const pct = (item.count / maxCount) * 100;
              const colors: Record<string, { bar: string; bg: string }> = {
                CRITICAL: { bar: "from-red-500 to-rose-500", bg: "bg-red-50" },
                HIGH: { bar: "from-orange-500 to-amber-500", bg: "bg-orange-50" },
                MEDIUM: { bar: "from-yellow-500 to-orange-400", bg: "bg-yellow-50" },
                LOW: { bar: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
              };
              const c = colors[item.priority] || { bar: "from-slate-400 to-slate-500", bg: "bg-slate-50" };

              return (
                <div key={item.priority}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-r", c.bar)} />
                      {item.priority}
                    </span>
                    <span className="font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className={cn("h-3 rounded-full overflow-hidden", c.bg)}>
                    <motion.div
                      className={cn("h-full rounded-full bg-gradient-to-r", c.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Top Categories
          </h3>
          {data.byCategory.length === 0 ? (
            <p className="text-sm text-slate-400">No categories yet</p>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {data.byCategory.map((item) => (
                <motion.div
                  key={item.category}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-xl p-4 text-center border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-default"
                >
                  <AnimatedCategoryCount value={item.count} />
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {item.category}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ═══ Donut Chart Component ═══
function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">No data</p>;
  }

  const statusColors: Record<string, { stroke: string; fill: string; label: string }> = {
    OPEN: { stroke: "#3b82f6", fill: "bg-blue-500", label: "Open" },
    IN_PROGRESS: { stroke: "#8b5cf6", fill: "bg-purple-500", label: "In Progress" },
    RESOLVED: { stroke: "#10b981", fill: "bg-emerald-500", label: "Resolved" },
    REJECTED: { stroke: "#ef4444", fill: "bg-red-500", label: "Rejected" },
  };

  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = data.map((item) => {
    const pct = item.count / total;
    const dashLength = pct * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += dashLength;
    return { ...item, pct, dashLength, offset };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Data segments */}
          {segments.map((seg, i) => {
            const color = statusColors[seg.status]?.stroke || "#94a3b8";
            return (
              <motion.circle
                key={seg.status}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
                strokeDashoffset={-seg.offset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${seg.dashLength} ${circumference - seg.dashLength}` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {segments.map((seg) => {
          const config = statusColors[seg.status] || { fill: "bg-slate-400", label: seg.status };
          return (
            <div key={seg.status} className="flex items-center gap-3">
              <span className={cn("w-3 h-3 rounded-full shrink-0", config.fill)} />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {config.label}
                </p>
                <p className="text-xs text-slate-400">
                  {seg.count} ({Math.round(seg.pct * 100)}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ Animated Category Counter ═══
function AnimatedCategoryCount({ value }: { value: number }) {
  const animatedValue = useAnimatedCounter(value, 800);
  return <p className="text-2xl font-bold text-slate-900 tabular-nums">{animatedValue}</p>;
}

// ═══ Gradient Stat Card ═══
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
  const animatedValue = useAnimatedCounter(value);

  return (
    <div className={cn("rounded-2xl p-5 text-white relative overflow-hidden shadow-lg", gradient)}>
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
        <p className="text-3xl font-bold tabular-nums">{animatedValue}</p>
        <p className="text-sm font-medium text-white/80">{label}</p>
      </div>
    </div>
  );
}
