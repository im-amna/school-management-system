// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconChalkboard,
  IconBuildingSkyscraper,
  IconUserPlus,
  IconCalendarStats,
  IconReportMoney,
  IconArrowUpRight,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Student = { id: string; enrolledAt: string; user: { name: string } };
type Teacher = { id: string; user: { name: string }; subject: string };
type ClassType = {
  id: string;
  name: string;
  section: string;
  students: { id: string }[];
};

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  badge,
  badgeType = "success",
  footer,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeType?: "success" | "warning";
  footer?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6">
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}
        >
          <span className={iconColor}>{icon}</span>
        </div>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
            badgeType === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {badge}
        </span>
      </div>
      <p className="text-3xl font-semibold text-slate-800 mb-1">{value}</p>
      <p className="text-sm text-slate-400 font-medium mb-3">{label}</p>
      {footer && (
        <p className="text-xs text-slate-400 border-t border-slate-50 pt-3">
          {footer}
        </p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/students").then((r) => r.json()),
      fetch("/api/admin/teachers").then((r) => r.json()),
      fetch("/api/admin/classes").then((r) => r.json()),
    ]).then(([s, t, c]) => {
      setStudents(Array.isArray(s) ? s : []);
      setTeachers(Array.isArray(t) ? t : []);
      setClasses(Array.isArray(c) ? c : []);
    });
  }, []);

  const classChartData = classes.map((c) => ({
    name: `${c.name} ${c.section}`,
    students: c.students.length,
  }));

  const recentStudents = [...students]
    .sort(
      (a, b) =>
        new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
    )
    .slice(0, 5);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-7 max-w-7xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">{today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total students"
        value={students.length}
        icon={<IconUsers size={20} />}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        badge="+3 this week"
        footer={`Across ${classes.length} classes`}
      />
      <StatCard
        label="Teachers"
        value={teachers.length}
        icon={<IconChalkboard size={20} />}
        iconBg="bg-teal-50"
        iconColor="text-teal-600"
        badge="Active"
        footer="All currently assigned"
      />
      <StatCard
        label="Fees collected"
        value="PKR 2.4L"
        icon={<IconReportMoney size={20} />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        badge="12 pending"
        badgeType="warning"
        footer="12 invoices awaiting payment"
      />
      <StatCard
        label="Attendance today"
        value="89%"
        icon={<IconCalendarStats size={20} />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        badge="↑ from 84%"
        footer="5% improvement this week"
      />
</div>
      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-slate-700">
              Students per class
            </p>
            <Link
              href="/admin/classes"
              className="text-xs text-violet-600 hover:underline"
            >
              See all
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-5">Enrollment distribution</p>
          {classChartData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-slate-300 text-sm">
              No class data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={classChartData} barSize={28}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "0.5px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="students" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-slate-700">
              Recent activity
            </p>
            <span className="text-xs text-slate-400">Last 24 hours</span>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Latest enrollments and updates
          </p>
          <div className="space-y-3">
            {recentStudents.length === 0 ? (
              <p className="text-sm text-slate-300">No activity yet</p>
            ) : (
              recentStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <IconUserPlus size={13} className="text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {s.user.name} enrolled as student
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {new Date(s.enrolledAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))
            )}
            {teachers.slice(0, 2).map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <IconChalkboard size={13} className="text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">
                    {t.user.name} added as {t.subject} teacher
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0">
                  Recently
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">
          Quick actions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            {
              label: "Add student",
              href: "/admin/students",
              icon: IconUsers,
              color:
                "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200",
            },
            {
              label: "Add teacher",
              href: "/admin/teachers",
              icon: IconChalkboard,
              color:
                "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200",
            },
            {
              label: "Create class",
              href: "/admin/classes",
              icon: IconBuildingSkyscraper,
              color:
                "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
            },
            {
              label: "Attendance",
              href: "/admin/attendance",
              icon: IconCalendarStats,
              color:
                "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200",
            },
            {
              label: "Record fee",
              href: "/admin/fees",
              icon: IconReportMoney,
              color:
                "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200",
            },
            {
              label: "All students",
              href: "/admin/students",
              icon: IconArrowUpRight,
              color:
                "hover:bg-slate-50 hover:text-slate-700 hover:border-slate-200",
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-100 text-slate-500 text-xs font-medium transition-all text-center ${action.color}`}
              >
                <Icon size={18} />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
