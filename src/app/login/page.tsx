// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  IconSchool,
  IconUsers,
  IconCalendarStats,
  IconChartBar,
  IconLock,
} from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push("/dashboard");
  };

  const demoAccounts = [
    { label: "Admin", email: "admin@school.com", color: "bg-violet-100 text-violet-700 hover:bg-violet-200" },
    { label: "Teacher", email: "sarah.ahmed@school.com", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    { label: "Student", email:  "ali.khan@student.com",  color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  ];

  const features = [
    { icon: <IconUsers size={20} />, text: "Role-based access for every user" },
    { icon: <IconCalendarStats size={20} />, text: "Real-time attendance tracking" },
    { icon: <IconChartBar size={20} />, text: "Smart results & analytics" },
    { icon: <IconLock size={20} />, text: "Secure & privacy-first platform" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
            <IconSchool size={22} color="white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">EduManage</span>
        </div>

        {/* Hero Text */}
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your school,{" "}
            <span className="text-violet-400">all in one place.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10">
            Attendance, results, classes and people — built for admins, teachers, and students.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-violet-400">
                  {f.icon}
                </div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs">
          © 2026 EduManage. Built with Next.js + Prisma.
        </p>
      </div>

      {/* Right — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <IconSchool size={18} color="white" />
            </div>
            <span className="text-slate-800 font-bold text-lg">EduManage</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@school.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <p className="text-xs text-slate-400 text-center mb-3">Quick demo access</p>
            <div className="flex gap-2 justify-center">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => {
                    setEmail(acc.email);
                setPassword(`${acc.label.toLowerCase()}123`);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-300 text-center mt-2">Demo credentials — for evaluation only</p>
          </div>
        </div>
      </div>
    </div>
  );
}