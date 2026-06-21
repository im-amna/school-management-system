// src/app/teacher/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

type ClassType = {
  id: string;
  name: string;
  section: string;
  students: { id: string; rollNumber: string; user: { name: string } }[];
};
type Result = {
  id: string;
  subject: string;
  marks: number;
  totalMarks: number;
  student: { user: { name: string; email: string } };
  class: { name: string; section: string };
};

const getGrade = (pct: number) => {
  if (pct >= 90)
    return { label: "A+", color: "bg-emerald-50 text-emerald-700" };
  if (pct >= 80) return { label: "A", color: "bg-emerald-50 text-emerald-700" };
  if (pct >= 70) return { label: "B", color: "bg-blue-50 text-blue-700" };
  if (pct >= 60) return { label: "C", color: "bg-amber-50 text-amber-700" };
  if (pct >= 50) return { label: "D", color: "bg-orange-50 text-orange-700" };
  return { label: "F", color: "bg-red-50 text-red-600" };
};

export default function TeacherResultsPage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [form, setForm] = useState({
    studentId: "",
    classId: "",
    subject: "",
    marks: "",
    totalMarks: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchResults = async () => {
    const res = await fetch("/api/teacher/results").then((r) => r.json());
    setResults(Array.isArray(res) ? res : []);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/teacher/classes").then((r) => r.json()),
      fetch("/api/teacher/results").then((r) => r.json()),
    ]).then(([cls, res]) => {
      setClasses(Array.isArray(cls) ? cls : []);
      setResults(Array.isArray(res) ? res : []);
      setLoading(false);
    });
  }, []);

  const handleClassChange = (classId: string) => {
    setForm({ ...form, classId, studentId: "" });
    setSelectedClass(classes.find((c) => c.id === classId) || null);
  };

  const handleSubmit = async () => {
    setError("");
    if (
      (!editingId && (!form.studentId || !form.classId)) ||
      !form.subject ||
      !form.marks ||
      !form.totalMarks
    ) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const isEdit = editingId !== null;
    const res = await fetch(
      isEdit ? `/api/teacher/results/${editingId}` : "/api/teacher/results",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          marks: Number(form.marks),
          totalMarks: Number(form.totalMarks),
        }),
      },
    );
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setOpen(false);
    setEditingId(null);
    setForm({
      studentId: "",
      classId: "",
      subject: "",
      marks: "",
      totalMarks: "",
    });
    fetchResults();
  };

  const handleEdit = (r: Result) => {
    setEditingId(r.id);
    setForm({
      studentId: "",
      classId: "",
      subject: r.subject,
      marks: String(r.marks),
      totalMarks: String(r.totalMarks),
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this result?")) return;
    await fetch(`/api/teacher/results/${id}`, { method: "DELETE" });
    fetchResults();
  };

  const filtered = results.filter(
    (r) =>
      r.student.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Results</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {results.length} results recorded
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              studentId: "",
              classId: "",
              subject: "",
              marks: "",
              totalMarks: "",
            });
            setOpen(true);
            setError("");
          }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <IconPlus size={16} />
          Add result
        </button>
      </div>

      <div className="relative">
        <IconSearch
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          placeholder="Search by student or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Student
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Class
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Subject
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Marks
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Progress
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Grade
              </th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-slate-300 text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-slate-300 text-sm"
                >
                  No results found
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const pct = Math.round((r.marks / r.totalMarks) * 100);
                const grade = getGrade(pct);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                          {r.student.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {r.student.user.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {r.student.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">
                      {r.class.name} — {r.class.section}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {r.subject}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-sm">
                      {r.marks}/{r.totalMarks}
                    </td>
                    <td className="px-5 py-3.5 w-32">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">{pct}%</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${grade.color}`}
                      >
                        {grade.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
                        >
                          <IconEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
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
              <h3 className="text-base font-semibold text-slate-800">
                {editingId ? "Edit result" : "Add result"}
              </h3>
              <button
                onClick={() => {
                  setOpen(false);
                  setError("");
                }}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition"
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {!editingId && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Class
                    </label>
                    <select
                      value={form.classId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                      <option value="">Select a class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Student
                    </label>
                    <select
                      value={form.studentId}
                      onChange={(e) =>
                        setForm({ ...form, studentId: e.target.value })
                      }
                      disabled={!selectedClass}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white disabled:opacity-50"
                    >
                      <option value="">Select a student</option>
                      {selectedClass?.students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user.name} — {s.rollNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {[
                {
                  label: "Subject",
                  key: "subject",
                  placeholder: "Mathematics",
                  type: "text",
                },
                {
                  label: "Marks obtained",
                  key: "marks",
                  placeholder: "85",
                  type: "number",
                },
                {
                  label: "Total marks",
                  key: "totalMarks",
                  placeholder: "100",
                  type: "number",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    setError("");
                  }}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update"
                      : "Add result"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
