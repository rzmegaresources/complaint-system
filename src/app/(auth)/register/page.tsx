"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!name || !email || !password) {
        setError("All fields are required");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      // Demo mode — just redirect to login
      router.push("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 auth-gradient-bg relative overflow-hidden">
      {/* Floating glow orbs */}
      <div className="glow-orb-1 absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="glow-orb-2 absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[140px] pointer-events-none" />
      <div className="glow-orb-3 absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-blue-500/15 blur-[100px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

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
          <p className="text-sm text-slate-400 mt-1">
            AI-Driven Networking & Information Hub
          </p>
        </motion.div>

        {/* Register Card */}
        <motion.div
          className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl border border-white/[0.12] p-8 shadow-2xl shadow-black/20"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <motion.h2
            className="text-lg font-semibold text-white mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Register
          </motion.h2>

          <form onSubmit={handleRegister} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white/[0.07] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:bg-white/[0.1] transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/[0.07] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:bg-white/[0.1] transition-all duration-300"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 bg-white/[0.07] border border-white/[0.12] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:bg-white/[0.1] transition-all duration-300 pr-12"
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <motion.p
            className="text-xs text-slate-400 text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign In
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
