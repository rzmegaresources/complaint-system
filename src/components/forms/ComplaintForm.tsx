"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Zod validation schema
const complaintSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be under 100 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().optional(),
  description: z
    .string()
    .min(20, "Please describe your issue in at least 20 characters")
    .max(2000, "Description must be under 2000 characters"),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const categories = [
  "IT & Technology",
  "Maintenance",
  "HR & People",
  "Finance",
  "Security",
  "Facilities",
  "Other",
];

export default function ComplaintForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: "",
      category: "",
      location: "",
      description: "",
    },
  });

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: 1, // TODO: Replace with actual user ID from auth
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      const ticket = await response.json();

      toast.success("Complaint Submitted!", {
        description: `Your ticket has been analyzed by AI. Priority: ${ticket.aiAnalysis?.priority || "MEDIUM"}`,
      });

      reset();
    } catch (error) {
      console.error("[COMPLAINT_FORM]", error);
      toast.error("Submission Failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-1">
        Submit a Complaint
      </h2>
      <p className="text-sm text-slate-500 mb-8">
        Describe your issue and our AI will analyze it automatically.
      </p>

      {/* Title */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="Brief summary of your issue"
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none",
            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            errors.title
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          )}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Category + Location Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register("category")}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none appearance-none",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              errors.category
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50 hover:border-slate-300"
            )}
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-500">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Location <span className="text-slate-400">(Optional)</span>
          </label>
          <input
            {...register("location")}
            type="text"
            placeholder="e.g., Floor 3, Room 201"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm transition-colors outline-none hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={5}
          placeholder="Explain your issue in detail. The AI will analyze this to suggest a priority and category."
          className={cn(
            "w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none resize-none",
            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            errors.description
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          )}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all",
          isSubmitting
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/25"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI is analyzing your complaint...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Complaint
          </>
        )}
      </button>
    </form>
  );
}
