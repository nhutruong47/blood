import { useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Droplet,
  AlertCircle,
  Calendar,
  Settings,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatRelativeTime } from "@/shared/utils/format";

type NotificationType = "request" | "emergency" | "appointment" | "system";

interface Notification {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
}

type FilterType = "all" | "unread" | "request" | "emergency" | "appointment" | "system";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "All",
  unread: "Unread",
  request: "Requests",
  emergency: "Alerts",
  appointment: "Appointments",
  system: "System",
};

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  request: Droplet,
  emergency: AlertCircle,
  appointment: Calendar,
  system: Settings,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  request: "bg-red-100 text-red-700",
  emergency: "bg-orange-100 text-orange-700",
  appointment: "bg-blue-100 text-blue-700",
  system: "bg-slate-100 text-slate-700",
};

// Notification delivery is still in-progress in the backend. The inbox UI
// shell is kept so once the /api/notifications endpoint is added the page
// needs no further design work — only a query hook swap.
const INITIAL_NOTIFICATIONS: Notification[] = [];

export function NotificationInbox() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const counts: Record<FilterType, number> = {
    all: notifications.length,
    unread: unreadCount,
    request: notifications.filter((n) => n.type === "request").length,
    emergency: notifications.filter((n) => n.type === "emergency").length,
    appointment: notifications.filter((n) => n.type === "appointment").length,
    system: notifications.filter((n) => n.type === "system").length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Notifications API pending</p>
          <p>
            The inbox UI is wired and ready. It will auto-populate once
            <code className="px-1 bg-amber-100 rounded ml-1">
              GET /api/notifications
            </code>
            is published.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-red-600">{unreadCount}</span> unread
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" aria-hidden="true" />
            Mark all as read
          </button>
        )}
      </div>

      <div
        className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1"
        role="tablist"
        aria-label="Filter notifications"
      >
        {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={isActive}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 ${
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {FILTER_LABELS[f]}
              {counts[f] > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    isActive ? "bg-red-200 text-red-800" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {counts[f]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="You will see booking confirmations, emergency alerts and certificates here."
          icon={<Inbox className="w-8 h-8 text-slate-400" aria-hidden="true" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filtered.map((notif) => {
            const Icon = TYPE_ICON[notif.type];
            const colorClass = TYPE_COLOR[notif.type];
            return (
              <article
                key={notif.id}
                className={`p-4 hover:bg-slate-50 transition-colors ${
                  !notif.read ? "bg-blue-50/30" : ""
                }`}
                aria-label={`${notif.title}, ${notif.read ? "read" : "unread"}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{notif.body}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}