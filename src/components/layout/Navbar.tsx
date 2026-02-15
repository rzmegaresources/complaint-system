"use client";

import { Bell, Search, User, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userLoginId, setUserLoginId] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.name) setUserName(user.name);
        if (user.email) setUserEmail(user.email);
        if (user.loginId) setUserLoginId(user.loginId);
      }
    } catch {}
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 h-16 flex items-center justify-between px-6">
      {/* Left: Search */}
      <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-2.5 rounded-xl w-64 md:w-96 transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:bg-white border border-transparent focus-within:border-indigo-200">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search tickets, documents..."
          className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* AI Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600">AI Active</span>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-indigo-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden md:block">
              {userName}
            </span>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-4 py-3 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail || userLoginId}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                Profile Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
