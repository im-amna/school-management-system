// src/app/admin/students/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IconUserPlus, IconTrash, IconEdit, IconSearch, IconX } from "@tabler/icons-react";

type Student = {
  id: string;
  rollNumber: string;
  enrolledAt: string;
  user: { id: string; name: string; email: string };
  class: { id: string; name: string; section: string } | null;
};

type ClassOption = { id: string; name: string; section: string };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", rollNumber: "", classId: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/students");
    setStudents(await res.json());
    setLoading(false);
  };

  const fetchClasses = async () => {
    const res = await fetch("/api/admin/classes");
    setClasses(await res.json());
  };

  useEffect(() => { fetchStudents(); fetchClasses(); }, []);

  const handleSubmit = async () => {
    setError("");
    const isEdit = editingId !== null;
    if (!form.name || !form.email || (!isEdit && !form.password) || !form.rollNumber) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const res = await fetch(isEdit ? `/api/admin/students/${editingId}` : "/api/admin/students", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "Something went wrong"); return; }
    setOpen(false);
    setEditingId(null);
    setForm({ name: "", email: "", password: "", rollNumber: "", classId: "" });
    fetchStudents();
  };

  const handleEditClick = (s: Student) => {
    setEditingId(s.id);
    setForm({ name: s.user.name, email: s.user.email, password: "", rollNumber: s.rollNumber, classId: s.class?.id || "" });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    fetchStudents();
  };

  const filtered = students.filter(
    (s) =>
      s.user.name.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Students</h2>
          <p className="text-sm text-slate-400 mt-0.5">{students.length} students enrolled</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ name: "", email: "", password: "", rollNumber: "", classId: "" });
            setOpen(true);
          }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <IconUserPlus size={16} />
          Add student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search by name, email or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Student</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Roll no</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Class</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Enrolled</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-300 text-sm">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-300 text-sm">No students found</td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-semibold text-xs flex-shrink-0">
                        {s.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{s.user.name}</p>
                        <p className="text-slate-400 text-xs">{s.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-violet-50 text-violet-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {s.rollNumber}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">
                    {s.class ? `${s.class.name} — ${s.class.section}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(s.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => handleEditClick(s)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"
                      >
                        <IconEdit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">
                {editingId ? "Edit student" : "Add new student"}
              </h3>
              <button
                onClick={() => { setOpen(false); setError(""); }}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Full name", key: "name", placeholder: "Ali Raza", type: "text" },
                { label: "Email", key: "email", placeholder: "ali@school.com", type: "email" },
                { label: editingId ? "New password (optional)" : "Password", key: "password", placeholder: "••••••••", type: "password" },
                { label: "Roll number", key: "rollNumber", placeholder: "S-001", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Class</label>
                <select
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="">Select a class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.section}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setOpen(false); setError(""); }}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingId ? "Update" : "Add student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}