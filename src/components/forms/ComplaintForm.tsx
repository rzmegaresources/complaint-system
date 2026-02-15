"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState, useCallback, useRef } from "react";
import { Send, Loader2, ImagePlus, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [LocationPicker, setLocationPicker] = useState<React.ComponentType<{
    latitude: number | null;
    longitude: number | null;
    onLocationChange: (lat: number, lng: number) => void;
  }> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  // Lazy-load the map component
  const toggleMap = async () => {
    if (!showMap && !LocationPicker) {
      const mod = await import("@/components/maps/LocationPicker");
      setLocationPicker(() => mod.default);
    }
    setShowMap(!showMap);
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);

    try {
      // Upload image first if present
      let imageUrl: string | undefined;
      if (imageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Image upload failed");
        }
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
        setUploading(false);
      }

      // Get the logged-in user's ID from localStorage
      let userId = 1;
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const user = JSON.parse(stored);
          if (user.id) userId = user.id;
        }
      } catch {}

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId,
          imageUrl,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to submit complaint");
      }

      const ticket = await response.json();

      toast.success("Complaint Submitted!", {
        description: `Your ticket has been analyzed by AI. Priority: ${ticket.aiAnalysis?.priority || "MEDIUM"}`,
      });

      reset();
      removeImage();
      setLatitude(null);
      setLongitude(null);
      setShowMap(false);
    } catch (error) {
      console.error("[COMPLAINT_FORM]", error);
      toast.error("Submission Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setUploading(false);
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
      <div className="mb-5">
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

      {/* Image Upload */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          📷 Attach Photo <span className="text-slate-400">(Optional)</span>
        </label>

        {imagePreview ? (
          <div className="relative group w-fit">
            <Image
              src={imagePreview}
              alt="Complaint preview"
              width={400}
              height={300}
              className="rounded-xl border border-slate-200 object-cover max-h-[200px] w-auto"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all"
          >
            <ImagePlus className="w-8 h-8" />
            <span className="text-sm font-medium">
              Click to upload an image
            </span>
            <span className="text-xs">JPEG, PNG, WebP (max 5MB)</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Map Location Pin */}
      <div className="mb-8">
        <button
          type="button"
          onClick={toggleMap}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
            showMap
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
          )}
        >
          <MapPin className="w-4 h-4" />
          {showMap ? "Hide Map" : "📍 Pin Location on Map"}
          {latitude && longitude && (
            <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
              ✓ Pinned
            </span>
          )}
        </button>

        {showMap && LocationPicker && (
          <div className="mt-3">
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={handleLocationChange}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all",
          isSubmitting || uploading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/25"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading image...
          </>
        ) : isSubmitting ? (
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
