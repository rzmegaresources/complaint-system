import Link from "next/link";
import { ArrowRight, Shield, User } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Complaint Management System
        </h1>
        <p className="text-lg text-slate-500">
          AI-powered complaint tracking, analysis, and resolution.
          <br />
          Experience the future of ticket management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* User Portal Card */}
        <Link
          href="/user"
          className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">User Portal</h2>
          <p className="text-sm text-slate-500 text-center mb-6">
            Submit complaints, track status in real-time, and chat with AI support.
          </p>
          <span className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
            Enter Portal <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        {/* Admin Dashboard Card */}
        <Link
          href="/admin"
          className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all"
        >
          <div className="absolute top-4 right-4 px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
            ADMIN ACCESS
          </div>
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 text-center mb-6">
            Manage tickets, view AI analytics, and update knowledge base.
          </p>
          <span className="flex items-center gap-2 text-sm font-semibold text-red-600 group-hover:gap-3 transition-all">
            Access Dashboard <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      <p className="mt-12 text-sm text-slate-400">
        &copy; 2026 ComplaintSys. Powered by Gemini AI.
      </p>
    </div>
  );
}
