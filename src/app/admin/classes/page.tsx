// src/app/admin/classes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IconPlus, IconTrash, IconEdit, IconSearch, IconBuildingSkyscraper, IconUsers, IconX } from "@tabler/icons-react";

type Class = {
  id: string;
  name: string;
  section: string;
  year: number;
  teacher: { id: string; subject: string; user: { name: string; email: string } };
  students: { id: string }[];
};

type Teacher = { id: string; subject: string; user: { name: string } };

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", section: "", year: "", teacherId: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/classes");
    setClasses(await res.json());
    setLoading(false);
  };

  const fetchTeachers = async () => {
    const res = await fetch("/api/admin/teachers");
    setTeachers(await res.json());
  };

  useEffect(() => { fetchClasses(); fetchTeachers(); }, []);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.section || !form.year || !form.teacherId) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const isEdit = editingId !== null;
    const res = await fetch(isEdit ? `/api/admin/classes/${editingId}` : "/api/admin/classes", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, year: Number(form.year) }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "Something went wrong"); return; }
    setOpen(false);
    setEditingId(null);
    setForm({ name: "", section: "", year: "", teacherId: "" });
    fetchClasses();
  };

  const handleEditClick = (c: Class) => {
    setEditingId(c.id);
    setForm({ name: c.name, section: c.section, year: String(c.year), teacherId: c.teacher?.id || "" });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    fetchClasses();
  };

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.section.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher?.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Classes</h2>
          <p className="text-sm text-slate-400 mt-0.5">{classes.length} classes active</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ name: "", section: "", year: "", teacherId: "" }); setOpen(true); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <IconPlus size={16} />
          Add class
        </button>
      </div>

      <div className="relative">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search by class name, section or teacher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-300 text-sm col-span-3 text-center py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-300 text-sm col-span-3 text-center py-12">No classes found</p>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:border-slate-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                  <IconBuildingSkyscraper size={18} className="text-violet-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditClick(c)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition">
                    <IconEdit size={15} />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                    <IconTrash size={15} />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-800">{c.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Section {c.section} · {c.year}</p>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-[10px] flex-shrink-0">
                  {c.teacher?.user?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">{c.teacher?.user?.name || "—"}</p>
                  <p className="text-[11px] text-slate-400">{c.teacher?.subject || ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-50">
                <IconUsers size={13} className="text-slate-400" />
                <span className="text-xs text-slate-400">
                  {c.students.length} student{c.students.length !== 1 ? "s" : ""} enrolled
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">
                {editingId ? "Edit class" : "Add new class"}
              </h3>
              <button onClick={() => { setOpen(false); setError(""); }}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition">
                <IconX size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Class name", key: "name", placeholder: "10th Grade", type: "text" },
                { label: "Section", key: "section", placeholder: "A", type: "text" },
                { label: "Year", key: "year", placeholder: "2026", type: "number" },
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
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Teacher</label>
                <select
                  value={form.teacherId}
                  onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.user.name} — {t.subject}</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setOpen(false); setError(""); }}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                  {submitting ? "Saving..." : editingId ? "Update" : "Add class"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}