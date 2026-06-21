// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  IconLayoutDashboard,
  IconUsers,
  IconChalkboard,
  IconBuildingSkyscraper,
  IconSchool,
  IconLogout,
  IconCalendarStats,
  IconReportMoney,
  IconBell,
  IconSearch,
  IconCash,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import NotificationBell from "@/components/NotificationBell";

const mainNav = [
  { href: "/admin", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/admin/students", label: "Students", icon: IconUsers },
  { href: "/admin/teachers", label: "Teachers", icon: IconChalkboard },
  { href: "/admin/classes", label: "Classes", icon: IconBuildingSkyscraper },
  { href: "/admin/fees", label: "Fees", icon: IconCash },
];

const manageNav: typeof mainNav = [];

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: typeof mainNav;
  pathname: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
        {label}
      </p>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon
                size={17}
                className={isActive ? "text-violet-600" : "text-slate-400"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPage =
    [...mainNav, ...manageNav].find((n) => n.href === pathname)?.label ||
    "Admin";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay - dims background when sidebar is open on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-56 min-h-screen bg-white border-r border-slate-100 flex flex-col justify-between py-5 px-3 fixed left-0 top-0 bottom-0 z-40 transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between px-3 mb-7">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconSchool size={16} color="white" />
              </div>
              <div>
                <p className="text-slate-800 font-semibold text-sm leading-tight">
                  EduManage
                </p>
                <p className="text-slate-400 text-[11px]">Admin panel</p>
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

          <NavSection label="Main" items={mainNav} pathname={pathname} />
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all w-full"
        >
          <IconLogout size={17} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-56">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
              aria-label="Open menu"
            >
              <IconMenu2 size={20} />
            </button>
            <h1 className="text-slate-800 font-semibold text-base">
              {currentPage}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-violet-700 text-xs font-bold">A</span>
            </div>
            <span className="text-sm text-slate-600 font-medium">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
