// src/app/student/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  IconCalendarStats,
  IconChartBar,
  IconBuildingSkyscraper,
  IconCircleCheck,
  IconCircleX,
  IconClock,
} from "@tabler/icons-react";

type StudentData = {
  attendance: { status: string }[];
  results: { marks: number; totalMarks: number; subject: string }[];
  user: { name: string; email: string };
};

export default function StudentPage() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [attRes, resRes, session] = await Promise.all([
        fetch("/api/student/attendance").then((r) => r.json()),
        fetch("/api/student/results").then((r) => r.json()),
        fetch("/api/auth/session").then((r) => r.json()),
      ]);
      setData({
        attendance: Array.isArray(attRes) ? attRes : [],
        results: Array.isArray(resRes) ? resRes : [],
        user: session?.user || { name: "Student", email: "" },
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const attendance = data?.attendance || [];
  const results = data?.results || [];
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;
  const total = attendance.length;
  const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;
  const avgMarks = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.marks / r.totalMarks) * 100, 0) / results.length)
    : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Welcome back, {data?.user.name}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Attendance rate", value: `${attendancePercent}%`, icon: IconCalendarStats, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", badge: `${present}/${total} days`, badgeColor: "bg-emerald-50 text-emerald-700" },
          { label: "Average score", value: `${avgMarks}%`, icon: IconChartBar, iconBg: "bg-blue-50", iconColor: "text-blue-600", badge: `${results.length} subjects`, badgeColor: "bg-blue-50 text-blue-700" },
          { label: "Subjects graded", value: results.length, icon: IconBuildingSkyscraper, iconBg: "bg-violet-50", iconColor: "text-violet-600", badge: "This term", badgeColor: "bg-violet-50 text-violet-700" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} className={card.iconColor} />
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-2xl font-semibold text-slate-800 mb-0.5">{card.value}</p>
              <p className="text-xs text-slate-400 font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Attendance Breakdown */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">Attendance breakdown</p>
          <p className="text-xs text-slate-400 mb-5">This term</p>
          {total === 0 ? (
            <p className="text-slate-300 text-sm">No attendance records yet</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Present", count: present, icon: IconCircleCheck, color: "text-emerald-500", bg: "bg-emerald-50", bar: "bg-emerald-500" },
                { label: "Absent", count: absent, icon: IconCircleX, color: "text-red-500", bg: "bg-red-50", bar: "bg-red-400" },
                { label: "Late", count: late, icon: IconClock, color: "text-amber-500", bg: "bg-amber-50", bar: "bg-amber-400" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={15} className={item.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600">{item.label}</span>
                        <span className="text-xs font-semibold text-slate-700">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.bar}`}
                          style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">Recent results</p>
          <p className="text-xs text-slate-400 mb-5">Latest grades</p>
          {results.length === 0 ? (
            <p className="text-slate-300 text-sm">No results recorded yet</p>
          ) : (
            <div className="space-y-3">
              {results.slice(0, 5).map((r, i) => {
                const pct = Math.round((r.marks / r.totalMarks) * 100);
                return (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm text-slate-700">{r.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{r.marks}/{r.totalMarks}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        pct >= 80 ? "bg-emerald-50 text-emerald-700" :
                        pct >= 50 ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}