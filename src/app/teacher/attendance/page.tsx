// src/app/teacher/attendance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IconPlus, IconCircleCheck, IconCircleX, IconClock, IconSearch, IconX } from "@tabler/icons-react";

type Student = { id: string; rollNumber: string; user: { name: string } };
type ClassType = { id: string; name: string; section: string; students: Student[] };
type AttendanceRecord = {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  student: { user: { name: string; email: string } };
  class: { name: string; section: string };
};

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", classId: "", date: "", status: "PRESENT" });
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/teacher/classes").then((r) => r.json()),
      fetch("/api/teacher/attendance").then((r) => r.json()),
    ]).then(([cls, att]) => {
      setClasses(Array.isArray(cls) ? cls : []);
      setRecords(Array.isArray(att) ? att : []);
      setLoading(false);
    });
  }, []);

  const handleClassChange = (classId: string) => {
    setForm({ ...form, classId, studentId: "" });
    setSelectedClass(classes.find((c) => c.id === classId) || null);
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.studentId || !form.classId || !form.date || !form.status) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date: new Date(form.date).toISOString() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "Something went wrong"); return; }
    setOpen(false);
    setForm({ studentId: "", classId: "", date: "", status: "PRESENT" });
    const att = await fetch("/api/teacher/attendance").then((r) => r.json());
    setRecords(Array.isArray(att) ? att : []);
  };

  const statusConfig = {
    PRESENT: { icon: IconCircleCheck, color: "text-emerald-600", bg: "bg-emerald-50", label: "Present" },
    ABSENT: { icon: IconCircleX, color: "text-red-500", bg: "bg-red-50", label: "Absent" },
    LATE: { icon: IconClock, color: "text-amber-500", bg: "bg-amber-50", label: "Late" },
  };

  const filtered = records.filter(
    (r) =>
      r.student.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.class.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Attendance</h2>
          <p className="text-sm text-slate-400 mt-0.5">{records.length} records total</p>
        </div>
        <button onClick={() => { setOpen(true); setError(""); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
          <IconPlus size={16} />
          Mark attendance
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Present", count: records.filter((r) => r.status === "PRESENT").length, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", badgeColor: "bg-emerald-50 text-emerald-700" },
          { label: "Absent", count: records.filter((r) => r.status === "ABSENT").length, iconBg: "bg-red-50", iconColor: "text-red-500", badgeColor: "bg-red-50 text-red-600" },
          { label: "Late", count: records.filter((r) => r.status === "LATE").length, iconBg: "bg-amber-50", iconColor: "text-amber-500", badgeColor: "bg-amber-50 text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-5">
            <p className="text-2xl font-semibold text-slate-800 mb-0.5">{s.count}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search by student or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Student</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Class</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-300 text-sm">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-300 text-sm">No records found</td></tr>
            ) : (
              filtered.map((r) => {
                const cfg = statusConfig[r.status];
                const Icon = cfg.icon;
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                          {r.student.user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{r.student.user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">{r.class.name} — {r.class.section}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-sm">
                      {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
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

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">Mark attendance</h3>
              <button onClick={() => { setOpen(false); setError(""); }}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition">
                <IconX size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Class</label>
                <select value={form.classId} onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                  <option value="">Select a class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.section}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Student</label>
                <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  disabled={!selectedClass}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white disabled:opacity-50">
                  <option value="">Select a student</option>
                  {selectedClass?.students.map((s) => <option key={s.id} value={s.id}>{s.user.name} — {s.rollNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(["PRESENT", "ABSENT", "LATE"] as const).map((s) => (
                    <button key={s} onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                        form.status === s
                          ? s === "PRESENT" ? "bg-emerald-500 text-white border-emerald-500"
                            : s === "ABSENT" ? "bg-red-500 text-white border-red-500"
                            : "bg-amber-500 text-white border-amber-500"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setOpen(false); setError(""); }}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                  {submitting ? "Saving..." : "Mark"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}