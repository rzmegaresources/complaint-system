"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bg01.jpg')" }}
      />
      {/* Light overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />


      <div className="w-full max-w-md relative z-10">
        {/* Logo Area */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
          >
            <Image src="/images/logo.png" alt="VoiceBox Logo" width={80} height={80} className="object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">VoiceBox</h1>
          <p
            className="text-base text-white font-bold mt-1"
            style={{ WebkitTextStroke: "0.5px black", textShadow: "0 0 4px rgba(0,0,0,0.5)" }}
          >
            AI-Driven Networking & Information Hub
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl border border-white/[0.12] p-8 shadow-2xl shadow-black/20"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <motion.h2
            className="text-lg font-semibold text-white mb-6 text-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Welcome back!
          </motion.h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label
                className="block text-xs font-semibold text-white mb-1.5"
                style={{ WebkitTextStroke: "0.3px black", textShadow: "0 0 3px rgba(0,0,0,0.5)" }}
              >
                Login ID
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 bg-white/[0.07] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:bg-white/[0.1] transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <label
                className="block text-xs font-semibold text-white mb-1.5"
                style={{ WebkitTextStroke: "0.3px black", textShadow: "0 0 3px rgba(0,0,0,0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/[0.07] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-400 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:bg-white/[0.1] transition-all duration-300 pr-12"
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
            </motion.div>

            {error && (
              <motion.p
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300",
                loading
                  ? "bg-blue-400/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
              )}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          className="text-center text-xs text-white font-semibold mt-6"
          style={{ WebkitTextStroke: "0.3px black", textShadow: "0 0 4px rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Secured with end-to-end encryption
        </motion.p>
      </div>
    </div>
  );
}
