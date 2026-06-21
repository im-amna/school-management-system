// src/app/student/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IconTrophy } from "@tabler/icons-react";

type ResultRecord = {
  id: string;
  subject: string;
  marks: number;
  totalMarks: number;
  class: { name: string; section: string };
};

const getGrade = (pct: number) => {
  if (pct >= 90) return { label: "A+", color: "bg-emerald-50 text-emerald-700" };
  if (pct >= 80) return { label: "A", color: "bg-emerald-50 text-emerald-700" };
  if (pct >= 70) return { label: "B", color: "bg-blue-50 text-blue-700" };
  if (pct >= 60) return { label: "C", color: "bg-amber-50 text-amber-700" };
  if (pct >= 50) return { label: "D", color: "bg-orange-50 text-orange-700" };
  return { label: "F", color: "bg-red-50 text-red-600" };
};

export default function StudentResultsPage() {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/results")
      .then((r) => r.json())
      .then((data) => { setResults(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const avg = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.marks / r.totalMarks) * 100, 0) / results.length)
    : 0;

  const overallGrade = getGrade(avg);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">My results</h2>
        <p className="text-sm text-slate-400 mt-0.5">Academic performance across all subjects</p>
      </div>

      {/* Summary Card */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Overall average</p>
              <p className="text-3xl font-semibold text-slate-800">{avg}%</p>
              <p className="text-xs text-slate-400 mt-1">{results.length} subject{results.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-semibold px-4 py-2 rounded-lg ${overallGrade.color}`}>
                {overallGrade.label}
              </span>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <IconTrophy size={20} className="text-amber-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Subject</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Class</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Marks</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Progress</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Grade</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-300 text-sm">Loading...</td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-300 text-sm">No results yet</td></tr>
            ) : (
              results.map((r) => {
                const pct = Math.round((r.marks / r.totalMarks) * 100);
                const grade = getGrade(pct);
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{r.subject}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.class.name} — {r.class.section}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.marks}/{r.totalMarks}</td>
                    <td className="px-5 py-3.5 w-36">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">{pct}%</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${grade.color}`}>
                        {grade.label}
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