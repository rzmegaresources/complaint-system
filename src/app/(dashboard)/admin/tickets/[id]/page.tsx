"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Flame,
  Meh,
  SmilePlus,
  Sparkles,
  User,
  Bot,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface TicketData {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  location: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  aiAnalysis: {
    category?: string;
    priority?: string;
    sentiment?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string; email: string };
  messages: MessageData[];
}

interface MessageData {
  id: number;
  content: string;
  createdAt: string;
  sender: { id: number; name: string; role: string };
}

const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

const priorityConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  CRITICAL: { color: "text-red-700", bg: "bg-red-100 border-red-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  HIGH: { color: "text-orange-700", bg: "bg-orange-100 border-orange-200", icon: <Flame className="w-3.5 h-3.5" /> },
  MEDIUM: { color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-200", icon: <Clock className="w-3.5 h-3.5" /> },
  LOW: { color: "text-green-700", bg: "bg-green-100 border-green-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const sentimentConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  ANGRY: { icon: <XCircle className="w-3.5 h-3.5" />, label: "Angry", color: "text-red-500 bg-red-50" },
  NEUTRAL: { icon: <Meh className="w-3.5 h-3.5" />, label: "Neutral", color: "text-slate-500 bg-slate-50" },
  CALM: { icon: <SmilePlus className="w-3.5 h-3.5" />, label: "Calm", color: "text-green-500 bg-green-50" },
};

export default function TicketDetailPage() {
  const params = useParams();

  const ticketId = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  // Fetch ticket details
  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`);
        if (!res.ok) throw new Error("Ticket not found");
        const data = await res.json();
        setTicket(data);
      } catch (error) {
        console.error("[TICKET_DETAIL]", error);
        toast.error("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    }
    if (ticketId) fetchTicket();
  }, [ticketId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  // Send a chat message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: Number(ticketId),
          content: message,
          senderId: 1, // Admin user (demo)
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const newMsg = await res.json();
      setTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
      );
      setMessage("");
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Update ticket status
  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(ticketId),
          status: newStatus,
          resolutionNote: newStatus === "RESOLVED" ? resolutionNote : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setTicket((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      if (newStatus === "RESOLVED") {
        toast.info("Resolution email sent to user");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Get AI solution suggestion (RAG)
  const handleGetAiSuggestion = async () => {
    if (!ticket) return;
    setLoadingAi(true);
    try {
      const res = await fetch("/api/rag/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: ticket.description }),
      });
      if (!res.ok) throw new Error("AI suggestion failed");
      const data = await res.json();
      setAiSuggestion(data.suggestion);
    } catch {
      setAiSuggestion(
        "AI suggestion unavailable. Ensure the knowledge base has documents uploaded."
      );
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-semibold text-slate-900 mb-2">Ticket not found</p>
        <Link href="/admin" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
  const sentiment = ticket.aiAnalysis?.sentiment
    ? sentimentConfig[ticket.aiAnalysis.sentiment]
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ticket Info + Chat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  #{ticket.id} — {ticket.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  by {ticket.user?.name || "Unknown"} ·{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                  priority.bg,
                  priority.color
                )}
              >
                {priority.icon}
                {ticket.priority}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              {ticket.description}
            </p>

            {/* AI Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {ticket.category && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                  {ticket.category}
                </span>
              )}
              {ticket.location && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                  📍 {ticket.location}
                </span>
              )}
              {sentiment && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
                    sentiment.color
                  )}
                >
                  {sentiment.icon}
                  {sentiment.label}
                </span>
              )}
            </div>

            {/* Complaint Image */}
            {ticket.imageUrl && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Attached Photo
                </p>
                <a
                  href={ticket.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Image
                    src={ticket.imageUrl}
                    alt="Complaint photo"
                    width={600}
                    height={400}
                    className="rounded-xl border border-slate-200 object-cover max-h-[300px] w-auto hover:shadow-lg transition-shadow cursor-zoom-in"
                  />
                </a>
              </div>
            )}

            {/* Map Location */}
            {ticket.latitude && ticket.longitude && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Pinned Location
                </p>
                <a
                  href={`https://www.google.com/maps?q=${ticket.latitude},${ticket.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Image
                    src={`https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=250&center=lonlat:${ticket.longitude},${ticket.latitude}&zoom=15&marker=lonlat:${ticket.longitude},${ticket.latitude};color:%233b82f6;size:large&apiKey=demo`}
                    alt="Location map"
                    width={600}
                    height={250}
                    className="rounded-xl border border-slate-200 w-full hover:shadow-lg transition-shadow cursor-pointer"
                    onError={(e) => {
                      // Fallback if static map API fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </a>
                <p className="text-xs text-slate-400 mt-1.5">
                  📌 {ticket.latitude.toFixed(5)}, {ticket.longitude.toFixed(5)} ·{" "}
                  <a
                    href={`https://www.google.com/maps?q=${ticket.latitude},${ticket.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Open in Google Maps ↗
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Chat / Messages */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">
                Ticket Chat
              </h2>
              <p className="text-xs text-slate-500">
                Communicate with the user
              </p>
            </div>

            {/* Messages list */}
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {(!ticket.messages || ticket.messages.length === 0) ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm">No messages yet. Start the conversation.</p>
                </div>
              ) : (
                ticket.messages.map((msg) => {
                  const isAdmin = msg.sender?.role === "ADMIN";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isAdmin ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-3 rounded-2xl text-sm",
                          isAdmin
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-slate-100 text-slate-800 rounded-bl-md"
                        )}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isAdmin ? "text-blue-200" : "text-slate-400"
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-100 flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all",
                  sending || !message.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                )}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Actions + AI */}
        <div className="space-y-6">
          {/* Status Control */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Update Status
            </h3>
            <div className="space-y-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || ticket.status === s}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    ticket.status === s
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  {s.replace("_", " ")}
                  {ticket.status === s && " ✓"}
                </button>
              ))}
            </div>

            {/* Resolution Note */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Resolution Note (optional)
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                placeholder="Explain how the issue was resolved..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* AI Suggestion (RAG) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Solution Suggestion
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Get an AI-powered solution based on the knowledge base
            </p>

            {aiSuggestion ? (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiSuggestion}
              </div>
            ) : (
              <button
                onClick={handleGetAiSuggestion}
                disabled={loadingAi}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get AI Suggestion
                  </>
                )}
              </button>
            )}
          </div>

          {/* Ticket Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-900">
                  {ticket.status.replace("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-medium text-slate-900">{ticket.priority}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-medium text-slate-900">
                  {ticket.category || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium text-slate-900">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">User</dt>
                <dd className="font-medium text-slate-900">
                  {ticket.user?.name || "Unknown"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
