"use client";

import { motion } from "framer-motion";
import { useTicketUpdates } from "@/lib/hooks/useTicketUpdates";
import {
  SendHorizonal,
  Search,
  Wrench,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const stages = [
  { key: "OPEN", label: "Submitted", icon: SendHorizonal },
  { key: "INVESTIGATING", label: "Investigating", icon: Search },
  { key: "IN_PROGRESS", label: "In Progress", icon: Wrench },
  { key: "RESOLVED", label: "Resolved", icon: CheckCircle2 },
];

function getStageIndex(status: string): number {
  const map: Record<string, number> = {
    OPEN: 0,
    INVESTIGATING: 1,
    IN_PROGRESS: 2,
    RESOLVED: 3,
  };
  return map[status] ?? 0;
}

interface TaskBarProps {
  ticketId: string;
}

export default function TaskBar({ ticketId }: TaskBarProps) {
  const { ticket, isLoading } = useTicketUpdates(ticketId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentStage = getStageIndex(ticket?.status || "OPEN");
  const progress = ((currentStage + 1) / stages.length) * 100;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Ticket Progress
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Live tracking — updates automatically when status changes
      </p>

      {/* Progress Bar Track */}
      <div className="relative mb-8">
        {/* Background Track */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full" />

        {/* Animated Fill */}
        <motion.div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Stage Nodes */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index <= currentStage;
            const isCurrent = index === currentStage;
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center"
              >
                {/* Circle */}
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors z-10",
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  )}
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>

                {/* Label */}
                <motion.p
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    isCurrent
                      ? "text-blue-600"
                      : isCompleted
                        ? "text-slate-700"
                        : "text-slate-400"
                  )}
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  {stage.label}
                </motion.p>

                {/* Pulse on current */}
                {isCurrent && (
                  <motion.div
                    className="absolute w-10 h-10 rounded-full bg-blue-400/30"
                    style={{ top: 0 }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Text */}
      <motion.div
        key={ticket?.status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
          {currentStage < 3 && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          {currentStage === 3 && <CheckCircle2 className="w-3.5 h-3.5" />}
          {stages[currentStage].label}
        </span>
      </motion.div>
    </div>
  );
}
