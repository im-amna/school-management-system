// src/app/student/attendance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IconCircleCheck, IconCircleX, IconClock } from "@tabler/icons-react";

type AttendanceRecord = {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  class: { name: string; section: string };
};

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/attendance")
      .then((r) => r.json())
      .then((data) => { setRecords(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const total = records.length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;

  const statusConfig = {
    PRESENT: { icon: IconCircleCheck, color: "text-emerald-600", bg: "bg-emerald-50", label: "Present" },
    ABSENT: { icon: IconCircleX, color: "text-red-500", bg: "bg-red-50", label: "Absent" },
    LATE: { icon: IconClock, color: "text-amber-500", bg: "bg-amber-50", label: "Late" },
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">My attendance</h2>
        <p className="text-sm text-slate-400 mt-0.5">Track your daily attendance records</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total days", value: total, iconBg: "bg-slate-100", iconColor: "text-slate-600", badge: "All records" },
          { label: "Present", value: present, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", badge: `${total > 0 ? Math.round((present/total)*100) : 0}%` },
          { label: "Absent", value: absent, iconBg: "bg-red-50", iconColor: "text-red-500", badge: `${total > 0 ? Math.round((absent/total)*100) : 0}%` },
          { label: "Late", value: late, iconBg: "bg-amber-50", iconColor: "text-amber-500", badge: `${total > 0 ? Math.round((late/total)*100) : 0}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 ${s.iconBg} rounded-lg`} />
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500`}>
                {s.badge}
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-800 mb-0.5">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Rate */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Overall attendance rate</p>
          <span className={`text-sm font-semibold ${pct >= 75 ? "text-emerald-600" : "text-red-500"}`}>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 75 ? "bg-emerald-500" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct < 75 && (
          <p className="text-xs text-red-500 mt-2">Attendance below 75% — please improve</p>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Class</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-300 text-sm">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-300 text-sm">No records yet</td></tr>
            ) : (
              records.map((r) => {
                const cfg = statusConfig[r.status];
                const Icon = cfg.icon;
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-700 text-sm">
                      {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">
                      {r.class.name} — {r.class.section}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <Icon size={13} />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}