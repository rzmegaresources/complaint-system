"use client";

import ComplaintForm from "@/components/forms/ComplaintForm";
import TaskBar from "@/components/ui/TaskBar";
import { useState } from "react";
import { Ticket, Megaphone, Sparkles } from "lucide-react";

export default function UserDashboard() {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-xl shadow-indigo-500/20">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/10 rounded-full translate-y-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">VoiceBox</h1>
          </div>
          <p className="text-sm text-white/80 max-w-md">
            Submit and track your complaints. Our AI-powered system analyzes
            each submission for faster resolution.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              AI-Powered Analysis
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
              📧 Email Notifications
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <ComplaintForm />
        </div>

        {/* Right Column: Live Tracking */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              Live Ticket Tracker
            </h2>

            {activeTicketId ? (
              <TaskBar ticketId={activeTicketId} />
            ) : (
              <div className="text-center py-8 text-slate-400 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-xl border border-dashed border-indigo-200">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-indigo-300" />
                <p className="text-sm font-medium">Submit a ticket to see live tracking.</p>
                <p className="text-xs mt-1 text-slate-400">
                  Or enter a ticket ID below
                </p>
              </div>
            )}

            {/* Quick Demo: Input ID manually */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                Track by Ticket ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ticket ID..."
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  onChange={(e) => setActiveTicketId(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
