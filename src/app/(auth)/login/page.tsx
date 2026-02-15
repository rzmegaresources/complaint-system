"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!loginId || !password) {
        setError("Login ID and password are required");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store user info for display across the app
      localStorage.setItem("user", JSON.stringify(data));

      // Route based on role from database
      switch (data.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "HR":
          router.push("/hr");
          break;
        default:
          router.push("/user");
          break;
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      <div className="w-full max-w-md">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">VoiceBox</h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-Powered Complaint System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Login ID
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. AD01, JD01, HR01"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all",
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] shadow-lg shadow-blue-500/25"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center mb-3">
              Demo Credentials (password: 123456)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setLoginId("AD01");
                  setPassword("123456");
                }}
                className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                👑 AD01
              </button>
              <button
                onClick={() => {
                  setLoginId("JD01");
                  setPassword("123456");
                }}
                className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                👤 JD01
              </button>
              <button
                onClick={() => {
                  setLoginId("HR01");
                  setPassword("123456");
                }}
                className="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                🧑‍💼 HR01
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
