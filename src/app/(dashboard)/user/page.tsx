"use client";

import ComplaintForm from "@/components/forms/ComplaintForm";
import TaskBar from "@/components/ui/TaskBar";
import { useState } from "react";
import { Ticket } from "lucide-react";

export default function UserDashboard() {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit and track your complaints.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <ComplaintForm />
        </div>

        {/* Right Column: Live Tracking Demo */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-500" />
              Live Ticket Tracker
            </h2>
            
            {activeTicketId ? (
              <TaskBar ticketId={activeTicketId} />
            ) : (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm">Submit a ticket to see live tracking here.</p>
                <p className="text-xs mt-2 text-slate-400">
                  (For demo: Open /admin to see tickets, then use the ID here)
                </p>
              </div>
            )}
            
            {/* Quick Demo: Input ID manually to track */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Track by Ticket ID
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="ID"
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
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
