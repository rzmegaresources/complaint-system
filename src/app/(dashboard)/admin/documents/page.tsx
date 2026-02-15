"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Loader2,

  Search,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

interface DocumentItem {
  id: number;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all documents
  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch("/api/rag/documents");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDocuments(data);
      } catch (error) {
        console.error("[DOCUMENTS]", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  // Upload new document
  const handleUpload = async () => {
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch("/api/rag/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          metadata: { title: title || "Untitled", source: "manual" },
        }),
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Document uploaded & embedded successfully!");
      setContent("");
      setTitle("");
      // Refresh list
      const res2 = await fetch("/api/rag/documents");
      if (res2.ok) setDocuments(await res2.json());
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.metadata as { title?: string })?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-purple-500" />
          Document Vault
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload knowledge documents to train the AI. The system will embed them
          for RAG-powered suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
            <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-500" />
              Upload Document
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Server Restart Procedure"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Paste the knowledge content here. This will be embedded and used for AI suggestions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !content.trim()}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all",
                  uploading || !content.trim()
                    ? "bg-purple-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98]"
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Embedding...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Embed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Document List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg font-medium text-slate-400">
                No documents yet
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Upload knowledge content to power AI suggestions
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      {(doc.metadata as { title?: string })?.title ||
                        "Untitled Document"}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {doc.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
