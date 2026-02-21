"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MessageSquare,
  ThumbsUp,
  ScrollText,
  Loader2,
  Star,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TicketHistory {
  id: number;
  ticketCode: string | null;
  title: string;
  status: string;
  priority: string;
  category: string | null;
  createdAt: string;
}

interface FeedbackHistory {
  id: number;
  feedbackCode: string | null;
  type: string;
  target: string | null;
  rating: number | null;
  comment: string;
  createdAt: string;
}

interface PetitionHistory {
  id: number;
  petitionCode: string | null;
  title: string;
  description: string;
  votes: number;
  status: string;
  createdAt: string;
}

const tabs = [
  { key: "all", label: "All", icon: Clock },
  { key: "complaints", label: "Complaints", icon: MessageSquare },
  { key: "feedback", label: "Feedback", icon: ThumbsUp },
  { key: "petitions", label: "Petitions", icon: ScrollText },
] as const;

const statusStyles: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-600",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export default function HistoryPage() {
  const [tickets, setTickets] = useState<TicketHistory[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackHistory[]>([]);
  const [petitions, setPetitions] = useState<PetitionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "complaints" | "feedback" | "petitions">("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await fetch(`/api/user/history?userId=${user.id}`);
        const data = await res.json();
        setTickets(data.tickets || []);
        setFeedbacks(data.feedbacks || []);
        setPetitions(data.petitions || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalCount = tickets.length + feedbacks.length + petitions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">My History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track all your submissions — {totalCount} total records
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
              activeTab === tab.key ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
            )}>
              {tab.key === "all" ? totalCount
                : tab.key === "complaints" ? tickets.length
                : tab.key === "feedback" ? feedbacks.length
                : petitions.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-sm text-slate-400 mt-2">Loading history...</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No submissions yet</p>
          <p className="text-xs text-slate-400 mt-1">Your complaints, feedback, and petitions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Complaints */}
          {(activeTab === "all" || activeTab === "complaints") &&
            tickets.map((ticket, i) => (
              <motion.div
                key={`t-${ticket.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {ticket.ticketCode || `#${ticket.id}`}
                        </span>
                        <span className="text-xs text-slate-400">Complaint</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mt-1">{ticket.title}</h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyles[ticket.status])}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", priorityStyles[ticket.priority])}>
                          {ticket.priority}
                        </span>
                        {ticket.category && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <Tag className="w-3 h-3" /> {ticket.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}

          {/* Feedback */}
          {(activeTab === "all" || activeTab === "feedback") &&
            feedbacks.map((fb, i) => (
              <motion.div
                key={`f-${fb.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white shrink-0">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          {fb.feedbackCode || `#${fb.id}`}
                        </span>
                        <span className="text-xs text-slate-400">Feedback — {fb.type}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1 line-clamp-2">{fb.comment}</p>
                      {fb.rating && (
                        <div className="flex gap-0.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn("w-3 h-3", s <= fb.rating! ? "fill-amber-400 text-amber-400" : "text-slate-200")}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}

          {/* Petitions */}
          {(activeTab === "all" || activeTab === "petitions") &&
            petitions.map((pet, i) => (
              <motion.div
                key={`p-${pet.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg text-white shrink-0">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {pet.petitionCode || `#${pet.id}`}
                        </span>
                        <span className="text-xs text-slate-400">Petition</span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyles[pet.status])}>
                          {pet.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mt-1">{pet.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {pet.votes} vote{pet.votes !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(pet.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
