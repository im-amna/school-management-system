// src/app/student/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  IconMail, IconId, IconBuildingSkyscraper,
  IconCalendar, IconChalkboard, IconEdit, IconCheck, IconX,
} from "@tabler/icons-react";

type ProfileData = {
  rollNumber: string;
  enrolledAt: string;
  user: { name: string; email: string };
  class: { name: string; section: string; year: number; teacher: { subject: string; user: { name: string } } } | null;
  attendance: { status: string }[];
  results: { marks: number; totalMarks: number; subject?: string }[];
};

const getGrade = (pct: number) => {
  if (pct >= 90) return { label: "A+", color: "bg-emerald-50 text-emerald-700" };
  if (pct >= 80) return { label: "A", color: "bg-emerald-50 text-emerald-700" };
  if (pct >= 70) return { label: "B", color: "bg-blue-50 text-blue-700" };
  if (pct >= 60) return { label: "C", color: "bg-amber-50 text-amber-700" };
  if (pct >= 50) return { label: "D", color: "bg-orange-50 text-orange-700" };
  return { label: "F", color: "bg-red-50 text-red-600" };
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const [attRes, resRes, sessionRes] = await Promise.all([
        fetch("/api/student/attendance").then((r) => r.json()),
        fetch("/api/student/results").then((r) => r.json()),
        fetch("/api/auth/session").then((r) => r.json()),
      ]);
      const name = sessionRes?.user?.name || "Student";
      setProfile({
        rollNumber: "—",
        enrolledAt: new Date().toISOString(),
        user: { name, email: sessionRes?.user?.email || "" },
        class: null,
        attendance: Array.isArray(attRes) ? attRes : [],
        results: Array.isArray(resRes) ? resRes : [],
      });
      setNewName(name);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const attendance = profile?.attendance || [];
  const results = profile?.results || [];
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.marks / r.totalMarks) * 100, 0) / results.length)
    : 0;
  const grade = getGrade(avgScore);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">My profile</h2>
        <p className="text-sm text-slate-400 mt-0.5">Your academic identity and performance summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-600 text-2xl font-semibold">
                {(newName || profile?.user.name || "S").charAt(0).toUpperCase()}
              </span>
            </div>

            {editing ? (
              <div className="mb-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-center border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                    className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <IconCheck size={13} /> Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  >
                    <IconX size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <p className="text-base font-semibold text-slate-800">{newName || profile?.user.name}</p>
                <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-emerald-500 transition">
                  <IconEdit size={14} />
                </button>
              </div>
            )}

            {saved && <p className="text-xs text-emerald-500 mb-2">Name updated</p>}
            <p className="text-xs text-slate-400 mb-3">{profile?.user.email}</p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-md ${grade.color}`}>
              Overall grade: {grade.label}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Quick stats</p>
            <div className="space-y-3">
              {[
                { label: "Attendance", value: `${attendancePct}%`, dot: "bg-emerald-500" },
                { label: "Avg score", value: `${avgScore}%`, dot: "bg-blue-500" },
                { label: "Subjects", value: `${results.length}`, dot: "bg-violet-500" },
                { label: "Total days", value: `${total}`, dot: "bg-amber-500" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span className="text-sm text-slate-500">{s.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-700 mb-4">Academic information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: IconMail, label: "Email", value: profile?.user.email || "—" },
                { icon: IconId, label: "Roll number", value: profile?.rollNumber || "—" },
                { icon: IconBuildingSkyscraper, label: "Class", value: profile?.class ? `${profile.class.name} — Section ${profile.class.section}` : "Not assigned" },
                { icon: IconCalendar, label: "Enrolled on", value: profile?.enrolledAt ? new Date(profile.enrolledAt).toLocaleDateString() : "—" },
                { icon: IconChalkboard, label: "Class teacher", value: profile?.class?.teacher?.user?.name || "—" },
                { icon: IconChalkboard, label: "Subject", value: profile?.class?.teacher?.subject || "—" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Icon size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-slate-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-slate-700">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-700 mb-4">Performance overview</p>
            {results.length === 0 ? (
              <p className="text-slate-300 text-sm">No results yet</p>
            ) : (
              <div className="space-y-4">
                {results.map((r, i) => {
                  const pct = Math.round((r.marks / r.totalMarks) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-700">{(r as any).subject || `Subject ${i + 1}`}</span>
                        <span className="text-slate-400">{r.marks}/{r.totalMarks} — {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}