"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  BookOpen,
  FileText,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  sourcesFound?: number;
  timestamp: Date;
}

const quickChips = [
  "Company policy",
  "Leave procedures",
  "IT support guide",
  "Safety regulations",
  "HR contact info",
];

export default function InfoHubPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "👋 Welcome to the **Information Hub**! I can help you find answers from our knowledge base — manuals, policies, procedures, laws, and more.\n\nAsk me anything, or try one of the quick topics below!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.answer || data.error || "Sorry, I couldn't find an answer.",
        sourcesFound: data.sourcesFound,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Information Hub</h1>
            <p className="text-sm text-slate-500">
              Ask questions about policies, manuals, procedures & more
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "ai" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-br-md"
                    : "bg-slate-100 text-slate-700 rounded-bl-md"
                )}
              >
                {msg.role === "ai" ? (
                  <div
                    className="prose prose-sm prose-slate max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                ) : (
                  msg.content
                )}
                {msg.sourcesFound !== undefined && msg.sourcesFound > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-xs text-slate-500">
                    <FileText className="w-3 h-3" />
                    {msg.sourcesFound} knowledge base source{msg.sourcesFound > 1 ? "s" : ""} referenced
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-start"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching knowledge base...
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Chips */}
      {messages.length <= 1 && (
        <motion.div
          className="flex flex-wrap gap-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setInput(chip);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-full hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3 h-3" />
              {chip}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input Bar */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about policies, manuals, procedures..."
            rows={1}
            className="w-full px-4 py-3 pr-12 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none bg-white"
          />
        </div>
        <motion.button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
