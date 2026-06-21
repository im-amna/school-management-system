// src/app/student/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  IconLayoutDashboard,
  IconCalendarStats,
  IconChartBar,
  IconSchool,
  IconLogout,
  IconUserCircle,
  IconBell,
  IconCash,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import NotificationBell from "@/components/NotificationBell";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/student", label: "Dashboard", icon: IconLayoutDashboard },
  {
    href: "/student/attendance",
    label: "My attendance",
    icon: IconCalendarStats,
  },
  { href: "/student/results", label: "My results", icon: IconChartBar },
  { href: "/student/profile", label: "My profile", icon: IconUserCircle },
  { href: "/student/fees", label: "My Fees", icon: IconCash },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const currentPage =
    navItems.find((n) => n.href === pathname)?.label || "Student";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`w-56 min-h-screen bg-white border-r border-slate-100 flex flex-col justify-between py-5 px-3 fixed left-0 top-0 bottom-0 z-40 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div>
          <div className="flex items-center justify-between px-3 mb-7">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconSchool size={16} color="white" />
              </div>
              <div>
                <p className="text-slate-800 font-semibold text-sm leading-tight">
                  EduManage
                </p>
                <p className="text-slate-400 text-[11px]">Student portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
              aria-label="Close menu"
            >
              <IconX size={18} />
            </button>
          </div>

          <div className="mb-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Menu
            </p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        isActive ? "text-emerald-600" : "text-slate-400"
                      }
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all w-full"
        >
          <IconLogout size={17} />
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-56">
        <header className="bg-white border-b border-slate-100 px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
              aria-label="Open menu"
            >
              <IconMenu2 size={20} />
            </button>
            <p className="text-slate-800 font-semibold text-sm">
              {currentPage}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />

            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 text-[11px] font-bold">
                  ST
                </span>
              </div>
              <span className="text-sm text-slate-600 font-medium">
                {session?.user?.name || "Student"}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
