"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ThumbsUp,
  Star,
  Send,
  Users,
  Building2,
  Wrench,
  Lightbulb,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const feedbackTypes = [
  { value: "staff", label: "Staff", icon: Users, color: "from-blue-500 to-indigo-500" },
  { value: "facility", label: "Facility", icon: Building2, color: "from-emerald-500 to-teal-500" },
  { value: "service", label: "Service", icon: Wrench, color: "from-purple-500 to-violet-500" },
  { value: "recommendation", label: "Recommendation", icon: Lightbulb, color: "from-amber-500 to-orange-500" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "from-slate-500 to-gray-500" },
];

interface FeedbackEntry {
  id: number;
  type: string;
  target: string | null;
  rating: number | null;
  comment: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
} as const;

export default function FeedbackPage() {
  const [type, setType] = useState("");
  const [target, setTarget] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<FeedbackEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`/api/feedback?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch {
      // silent fail
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !comment.trim()) {
      toast.error("Please select a type and write your feedback");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          target: target || null,
          rating: rating || null,
          comment,
          userId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      toast.success("Feedback submitted successfully!");
      setType("");
      setTarget("");
      setRating(0);
      setComment("");
      fetchHistory();
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">Submit Feedback</h1>
        <p className="text-sm text-slate-500 mt-1">
          Share your thoughts on staff, facilities, services, or make recommendations
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            What is your feedback about?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {feedbackTypes.map((ft) => (
              <button
                key={ft.value}
                type="button"
                onClick={() => setType(ft.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  type === ft.value
                    ? `border-transparent bg-gradient-to-br ${ft.color} text-white shadow-lg`
                    : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                )}
              >
                <ft.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{ft.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            About whom / what? <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. John from IT, Meeting Room 3, Cafeteria..."
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Rating <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star === rating ? 0 : star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-7 h-7 transition-colors",
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Your Feedback *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your feedback, suggestion, or recommendation in detail..."
            rows={4}
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading || !type || !comment.trim()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Feedback
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Feedback History */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          Your Feedback History
        </h2>

        {loadingHistory ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200/60">
            <ThumbsUp className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No feedback submitted yet</p>
            <p className="text-xs mt-1">Your feedback history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((fb) => {
              const fbType = feedbackTypes.find((t) => t.value === fb.type);
              return (
                <motion.div
                  key={fb.id}
                  variants={itemVariants}
                  className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white", fbType?.color || "from-slate-500 to-gray-500")}>
                        {fbType && <fbType.icon className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 capitalize">{fb.type}</span>
                        {fb.target && (
                          <span className="text-xs text-slate-500 ml-2">— {fb.target}</span>
                        )}
                        <p className="text-sm text-slate-600 mt-1">{fb.comment}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {fb.rating && (
                        <div className="flex gap-0.5 mb-1 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn("w-3 h-3", s <= fb.rating! ? "fill-amber-400 text-amber-400" : "text-slate-200")}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
