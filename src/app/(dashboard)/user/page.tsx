"use client";

import ComplaintForm from "@/components/forms/ComplaintForm";
import TaskBar from "@/components/ui/TaskBar";
import { useState } from "react";
import { Ticket } from "lucide-react";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ComplaintForm />
        </motion.div>

        {/* Right Column: Live Tracking */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
}
