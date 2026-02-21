"use client";

import { useEffect, useState, useRef } from "react";
import {
  Users,
  Loader2,
  Mail,
  Calendar,
  Shield,
  Search,
  UserCheck,
  UserX,
  Ticket,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  id: number;
  loginId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    tickets: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
} as const;

export default function HRDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ loginId: "", password: "123456", name: "", email: "", role: "USER" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/hr/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("[HR_DASHBOARD]", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/hr/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create user");
        return;
      }

      // Add new user to local state and close form
      setUsers((prev) => [data, ...prev]);
      setFormData({ loginId: "", password: "123456", name: "", email: "", role: "USER" });
      setShowAddForm(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    regularUsers: users.filter((u) => u.role === "USER").length,
    hrUsers: users.filter((u) => u.role === "HR").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-sm text-slate-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-lg shadow-teal-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            HR Dashboard
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 rounded-full text-xs font-semibold border border-teal-200">
              <Shield className="w-3 h-3" />
              HR Access
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            VoiceBox — User management and personnel overview
          </p>
        </div>

        {/* Add User Button */}
        <motion.button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all active:scale-[0.98]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4" />
          Add User
        </motion.button>
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  Add New User
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError("");
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Login ID
                    </label>
                    <input
                      type="text"
                      value={formData.loginId}
                      onChange={(e) =>
                        setFormData({ ...formData, loginId: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. JD01"
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Password
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="123456"
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="user@example.com"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all bg-white"
                  >
                    <option value="USER">👤 User</option>
                    <option value="ADMIN">👑 Admin</option>
                    <option value="HR">🧑‍💼 HR</option>
                    <option value="STAFF">🛠 Staff</option>
                  </select>
                </div>

                {formError && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    {formError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormError("");
                    }}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all",
                      formLoading
                        ? "bg-teal-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-lg hover:shadow-teal-500/25 active:scale-[0.98]"
                    )}
                  >
                    {formLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create User"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            label="Total Users"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
            gradient="from-teal-500 to-emerald-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Admin"
            value={stats.admins}
            icon={<Shield className="w-6 h-6" />}
            gradient="from-purple-500 to-indigo-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="Regular Users"
            value={stats.regularUsers}
            icon={<UserCheck className="w-6 h-6" />}
            gradient="from-blue-500 to-cyan-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            label="HR Staff"
            value={stats.hrUsers}
            icon={<UserX className="w-6 h-6" />}
            gradient="from-amber-500 to-orange-500"
          />
        </motion.div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/60 px-4 py-2.5 rounded-xl flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/50">
          {["ALL", "ADMIN", "USER", "HR", "STAFF"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                roleFilter === role
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-white"
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium text-slate-400">No users found</p>
          <p className="text-sm text-slate-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-slate-200/60">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user, index) => {
                const roleColors: Record<string, string> = {
                  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
                  USER: "bg-blue-100 text-blue-700 border-blue-200",
                  HR: "bg-teal-100 text-teal-700 border-teal-200",
                  STAFF: "bg-amber-100 text-amber-700 border-amber-200",
                };
                const roleEmoji: Record<string, string> = {
                  ADMIN: "👑",
                  USER: "👤",
                  HR: "🧑‍💼",
                  STAFF: "🛠",
                };
                return (
                  <motion.tr
                    key={user.id}
                    className="hover:bg-teal-50/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * Math.min(index, 10), duration: 0.3 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            {user.loginId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          roleColors[user.role] ||
                            "bg-slate-100 text-slate-600"
                        )}
                      >
                        {roleEmoji[user.role] || "👤"} {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Ticket className="w-3.5 h-3.5 text-slate-400" />
                        {user._count?.tickets ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

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

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div
      className={cn(
        "rounded-2xl p-5 text-white relative overflow-hidden shadow-lg bg-gradient-to-r",
        gradient
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      <div className="relative z-10">
        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm w-fit mb-3">
          {icon}
        </div>
        <p className="text-3xl font-bold tabular-nums">{animatedValue}</p>
        <p className="text-sm font-medium text-white/80">{label}</p>
      </div>
    </div>
  );
}
