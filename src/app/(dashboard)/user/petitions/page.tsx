"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ScrollText,
  Plus,
  ThumbsUp,
  X,
  Users,
  Clock,
  TrendingUp,
  Loader2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Petition {
  id: number;
  title: string;
  description: string;
  category: string | null;
  votes: number;
  voterIds: number[];
  status: string;
  createdAt: string;
  user: { id: number; name: string };
}

const categories = [
  "Workplace",
  "Facilities",
  "Policy",
  "Safety",
  "Technology",
  "Environment",
  "Other",
];

export default function PetitionsPage() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");

  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {};

  const fetchPetitions = async () => {
    try {
      const res = await fetch("/api/petitions");
      const data = await res.json();
      if (Array.isArray(data)) setPetitions(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/petitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category: category || null,
          userId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Petition created successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setShowModal(false);
      fetchPetitions();
    } catch {
      toast.error("Failed to create petition");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (petitionId: number) => {
    setVotingId(petitionId);
    try {
      const res = await fetch("/api/petitions/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petitionId, userId: user.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to vote");
        return;
      }

      toast.success("Vote recorded!");
      fetchPetitions();
    } catch {
      toast.error("Failed to vote");
    } finally {
      setVotingId(null);
    }
  };

  const sortedPetitions = [...petitions].sort((a, b) => {
    if (sortBy === "votes") return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Petitions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create or vote on petitions to voice collective concerns
          </p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Petition
        </motion.button>
      </motion.div>

      {/* Sort Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy("votes")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
            sortBy === "votes"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
        >
          <TrendingUp className="w-3 h-3" />
          Most Votes
        </button>
        <button
          onClick={() => setSortBy("newest")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
            sortBy === "newest"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
        >
          <Clock className="w-3 h-3" />
          Newest
        </button>
      </div>

      {/* Petition List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
        </div>
      ) : sortedPetitions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <ScrollText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No petitions yet</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to create one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPetitions.map((petition, i) => {
            const hasVoted = Array.isArray(petition.voterIds) && petition.voterIds.includes(user.id);
            const isCreator = petition.user.id === user.id;

            return (
              <motion.div
                key={petition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Vote Column */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <motion.button
                      onClick={() => !hasVoted && handleVote(petition.id)}
                      disabled={hasVoted || votingId === petition.id}
                      whileHover={!hasVoted ? { scale: 1.1 } : {}}
                      whileTap={!hasVoted ? { scale: 0.9 } : {}}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2",
                        hasVoted
                          ? "bg-indigo-100 border-indigo-300 text-indigo-600"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50"
                      )}
                    >
                      {votingId === petition.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ThumbsUp className={cn("w-5 h-5", hasVoted && "fill-indigo-500")} />
                      )}
                    </motion.button>
                    <span className="text-lg font-bold text-slate-800">{petition.votes}</span>
                    <span className="text-[10px] text-slate-400 font-medium">votes</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{petition.title}</h3>
                      {petition.status === "active" && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">
                      {petition.description}
                    </p>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {petition.category && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                          <Tag className="w-3 h-3" />
                          {petition.category}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3 h-3" />
                        by {petition.user.name}
                        {isCreator && " (you)"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(petition.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">Create Petition</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your petition about?"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the issue and why it needs collective attention..."
                    rows={4}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting || !title.trim() || !description.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ScrollText className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
