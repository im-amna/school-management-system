// src/components/NotificationBell.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { IconBell, IconCalendarStats, IconChartBar, IconCash } from "@tabler/icons-react";

type Notification = {
  id: string;
  message: string;
  type: "ATTENDANCE" | "RESULT" | "FEE";
  read: boolean;
  createdAt: string;
};

// Icon shown next to each notification, based on its type
const typeIcon = {
  ATTENDANCE: IconCalendarStats,
  RESULT: IconChartBar,
  FEE: IconCash,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(Array.isArray(data) ? data : []);
  };

  // Poll every 30 seconds for new notifications — simple way to feel "live" without websockets
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = async () => {
    setOpen((prev) => !prev);

    // Mark all as read when opening the dropdown
    if (unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
        aria-label="Notifications"
      >
        <IconBell size={20} className="text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-100 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type];
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 ${
                      !n.read ? "bg-violet-50/50" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}