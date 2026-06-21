"use client";

import { useEffect, useState } from "react";
import {
  IconCash,
  IconPlus,
  IconTrash,
  IconSearch,
  IconCircleCheck,
  IconClock,
  IconAlertCircle,
  IconTrendingUp,
} from "@tabler/icons-react";

type Fee = {
  id: string;
  amount: number;
  description: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  student: {
    user: { name: string; email: string };
    class: { name: string; section: string } | null;
  };
};

type Student = {
  id: string;
  user: { name: string; email: string };
  rollNumber: string;
};

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    description: "",
    dueDate: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = async () => {
    const res = await fetch("/api/admin/fees").then((r) => r.json());
    setFees(Array.isArray(res) ? res : []);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/fees").then((r) => r.json()),
      fetch("/api/admin/students").then((r) => r.json()),
    ]).then(([f, s]) => {
      setFees(Array.isArray(f) ? f : []);
      setStudents(Array.isArray(s) ? s : []);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (
      !form.studentId ||
      !form.amount ||
      !form.description ||
      !form.dueDate
    ) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/admin/fees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setOpen(false);

    setForm({
      studentId: "",
      amount: "",
      description: "",
      dueDate: "",
    });

    fetchFees();
  };

  const handleMarkPaid = async (id: string) => {
    await fetch(`/api/admin/fees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "PAID" }),
    });

    fetchFees();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fee record?")) return;

    await fetch(`/api/admin/fees/${id}`, {
      method: "DELETE",
    });

    fetchFees();
  };

  const totalCollected = fees
    .filter((f) => f.status === "PAID")
    .reduce((s, f) => s + f.amount, 0);

  const totalPending = fees
    .filter((f) => f.status === "PENDING")
    .reduce((s, f) => s + f.amount, 0);

  const overdueCount = fees.filter(
    (f) => f.status === "OVERDUE"
  ).length;

  const collectionRate =
    fees.length > 0
      ? Math.round(
          (fees.filter((f) => f.status === "PAID").length /
            fees.length) *
            100
        )
      : 0;

  const statusConfig = {
    PAID: {
      icon: <IconCircleCheck size={13} />,
      color:
        "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    PENDING: {
      icon: <IconClock size={13} />,
      color:
        "text-amber-700 bg-amber-50 border-amber-200",
    },
    OVERDUE: {
      icon: <IconAlertCircle size={13} />,
      color: "text-red-700 bg-red-50 border-red-200",
    },
  };

  const filtered = fees.filter((f) => {
    const matchSearch =
      f.student.user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      f.description
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "ALL" ||
      f.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const stats = [
    {
      label: "Collected",
      value: `PKR ${totalCollected.toLocaleString()}`,
      sub: `${fees.filter((f) => f.status === "PAID").length} payments`,
      icon: (
        <IconCircleCheck
          size={24}
          className="text-emerald-600"
        />
      ),
      text: "text-emerald-600",
    },
    {
      label: "Pending",
      value: `PKR ${totalPending.toLocaleString()}`,
      sub: `${fees.filter((f) => f.status === "PENDING").length} dues`,
      icon: (
        <IconClock size={24} className="text-amber-500" />
      ),
      text: "text-amber-500",
    },
    {
      label: "Overdue",
      value: overdueCount.toString(),
      sub: "records need attention",
      icon: (
        <IconAlertCircle
          size={24}
          className="text-red-500"
        />
      ),
      text: "text-red-500",
    },
    {
      label: "Collection Rate",
      value: `${collectionRate}%`,
      sub: "of total fees",
      icon: (
        <IconTrendingUp
          size={24}
          className="text-violet-600"
        />
      ),
      text: "text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm">
            <span className="font-medium text-violet-600">
              Finance
            </span>

            <span className="text-slate-300">›</span>

            <span className="text-slate-500">
              Fee Management
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate-900">
            Fee Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage and track all fee records in one place.
          </p>
        </div>

        <button
          onClick={() => {
            setOpen(true);
            setError("");
          }}
          className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          <IconPlus size={18} />
          Add Fee
        </button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {s.label}
                </p>

                <p className={`mt-4 text-3xl font-bold ${s.text}`}>
                  {s.value}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {s.sub}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <IconSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            placeholder="Search by student or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "PAID", "OVERDUE"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                filterStatus === s
                  ? "bg-violet-600 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  "Student",
                  "Description",
                  "Amount",
                  "Due Date",
                  "Status",
                  "Actions",
                ].map((item) => (
                  <th
                    key={item}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <div className="flex flex-col items-center">
                      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-50">
                        <IconCash
                          size={36}
                          className="text-violet-500"
                        />
                      </div>

                      <h3 className="text-xl font-semibold text-slate-900">
                        No fee records found
                      </h3>

                      <p className="mt-2 text-slate-500">
                        Add a new fee to get started.
                      </p>

                      <button
                        onClick={() => setOpen(true)}
                        className="mt-6 rounded-2xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700"
                      >
                        Add Fee
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-slate-100 transition hover:bg-violet-50/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                          {f.student.user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {f.student.user.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {f.student.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {f.description}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">
                        PKR {f.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(f.dueDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig[f.status].color}`}
                      >
                        {statusConfig[f.status].icon}
                        {f.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {f.status !== "PAID" ? (
                          <button
                            onClick={() => handleMarkPaid(f.id)}
                            className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <IconCircleCheck size={14} />
                            Paid
                          </span>
                        )}

                        <button
                          onClick={() => handleDelete(f.id)}
                          className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Add Fee Record
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Assign a fee to a student
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Student
                </label>

                <select
                  value={form.studentId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      studentId: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">Select a student</option>

                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.user.name} — {s.rollNumber}
                    </option>
                  ))}
                </select>
              </div>

              {[
                {
                  label: "Description",
                  key: "description",
                  placeholder: "Monthly tuition fee",
                  type: "text",
                },
                {
                  label: "Amount (PKR)",
                  key: "amount",
                  placeholder: "5000",
                  type: "number",
                },
                {
                  label: "Due Date",
                  key: "dueDate",
                  placeholder: "",
                  type: "date",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>

                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [field.key]: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              ))}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setOpen(false);
                  setError("");
                }}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {submitting ? "Adding..." : "Add Fee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}