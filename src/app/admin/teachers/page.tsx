// src/app/admin/teachers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IconUserPlus, IconTrash, IconEdit, IconSearch, IconX } from "@tabler/icons-react";

type Teacher = {
  id: string;
  subject: string;
  joinedAt: string;
  user: { id: string; name: string; email: string };
  classes: { id: string; name: string; section: string }[];
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", subject: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/teachers");
    setTeachers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleSubmit = async () => {
    setError("");
    const isEdit = editingId !== null;
    if (!form.name || !form.email || (!isEdit && !form.password) || !form.subject) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const res = await fetch(isEdit ? `/api/admin/teachers/${editingId}` : "/api/admin/teachers", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "Something went wrong"); return; }
    setOpen(false);
    setEditingId(null);
    setForm({ name: "", email: "", password: "", subject: "" });
    fetchTeachers();
  };

  const handleEditClick = (t: Teacher) => {
    setEditingId(t.id);
    setForm({ name: t.user.name, email: t.user.email, password: "", subject: t.subject });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });
    fetchTeachers();
  };

  const filtered = teachers.filter(
    (t) =>
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.user.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Teachers</h2>
          <p className="text-sm text-slate-400 mt-0.5">{teachers.length} teachers registered</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ name: "", email: "", password: "", subject: "" }); setOpen(true); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <IconUserPlus size={16} />
          Add teacher
        </button>
      </div>

      <div className="relative">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search by name, email or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Teacher</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Subject</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Classes</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Joined</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-300 text-sm">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-300 text-sm">No teachers found</td></tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-xs flex-shrink-0">
                        {t.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{t.user.name}</p>
                        <p className="text-slate-400 text-xs">{t.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {t.subject}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-sm">
                    {t.classes.length > 0
                      ? t.classes.map((c) => `${c.name}-${c.section}`).join(", ")
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(t.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => handleEditClick(t)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition">
                        <IconEdit size={15} />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
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

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">
                {editingId ? "Edit teacher" : "Add new teacher"}
              </h3>
              <button onClick={() => { setOpen(false); setError(""); }}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition">
                <IconX size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Full name", key: "name", placeholder: "Mr. Ahmed", type: "text" },
                { label: "Email", key: "email", placeholder: "ahmed@school.com", type: "email" },
                { label: editingId ? "New password (optional)" : "Password", key: "password", placeholder: "••••••••", type: "password" },
                { label: "Subject", key: "subject", placeholder: "Mathematics", type: "text" },
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
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setOpen(false); setError(""); }}
                  className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                  {submitting ? "Saving..." : editingId ? "Update" : "Add teacher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}