// src/app/teacher/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IconCalendarStats, IconChartBar, IconUsers } from "@tabler/icons-react";
import Link from "next/link";

type ClassType = {
  id: string;
  name: string;
  section: string;
  students: { id: string }[];
};

export default function TeacherPage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setClasses(data); setLoading(false); });
  }, []);

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <IconUsers size={18} className="text-blue-600" />
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">Active</span>
          </div>
          <p className="text-2xl font-semibold text-slate-800 mb-0.5">{loading ? "—" : classes.length}</p>
          <p className="text-xs text-slate-400">My classes</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
              <IconCalendarStats size={18} className="text-violet-600" />
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Enrolled</span>
          </div>
          <p className="text-2xl font-semibold text-slate-800 mb-0.5">{loading ? "—" : totalStudents}</p>
          <p className="text-xs text-slate-400">Total students</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
              <IconChartBar size={18} className="text-teal-600" />
            </div>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">Quick</span>
          </div>
          <p className="text-2xl font-semibold text-slate-800 mb-0.5">2</p>
          <p className="text-xs text-slate-400">Actions available</p>
        </div>
      </div>

      {/* My Classes */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-4">My classes</p>
        {loading ? (
          <p className="text-slate-300 text-sm">Loading...</p>
        ) : classes.length === 0 ? (
          <p className="text-slate-300 text-sm">No classes assigned yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <IconUsers size={17} className="text-blue-600" />
                  </div>
                  <span className="text-xs bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md font-medium">
                    Section {c.section}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">{c.name}</h4>
                <p className="text-xs text-slate-400 mb-4">{c.students.length} students enrolled</p>
                <div className="flex gap-2">
                  <Link href="/teacher/attendance"
                    className="flex-1 text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition">
                    Mark attendance
                  </Link>
                  <Link href="/teacher/results"
                    className="flex-1 text-center py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-xs font-medium transition">
                    Add results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}