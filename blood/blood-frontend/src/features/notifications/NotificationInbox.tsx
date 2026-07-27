import { useState, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Droplet,
  AlertCircle,
  Calendar,
  Settings,
  Inbox,
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

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Emergency Blood Request",
    body: "Your blood type (O+) is urgently needed at Cho Ray Hospital for a critical patient.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    type: "emergency",
  },
  {
    id: 2,
    title: "Appointment Reminder",
    body: "Your donation appointment is tomorrow at 9:00 AM at District 1 Blood Bank.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    read: false,
    type: "appointment",
  },
  {
    id: 3,
    title: "Certificate Issued",
    body: "Your donation certificate has been generated. Thank you for saving lives!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    read: true,
    type: "system",
  },
  {
    id: 4,
    title: "Blood Request Match",
    body: "A nearby request for A- blood has been posted. You may be a match.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    read: false,
    type: "request",
  },
  {
    id: 5,
    title: "Donation Completed",
    body: "Thank you for your recent donation. Your next eligible donation date is in 56 days.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    read: true,
    type: "system",
  },
  {
    id: 6,
    title: "Appointment Confirmed",
    body: "Your appointment at Binh Thanh Medical Hub on Friday at 2:00 PM is confirmed.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    read: true,
    type: "appointment",
  },
  {
    id: 7,
    title: "Critical Shortage Alert",
    body: "O- blood supply is critically low. If you are O-, please consider donating this week.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    read: false,
    type: "emergency",
  },
];

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
      {/* Header */}
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

      {/* Filter tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-1" role="tablist" aria-label="Filter notifications">
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

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={
            filter === "unread"
              ? "You're all caught up! No unread notifications."
              : "Nothing here right now."
          }
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
                className={`p-4 hover:bg-slate-50 transition-colors ${!notif.read ? "bg-blue-50/30" : ""}`}
                aria-label={`${notif.title}, ${notif.read ? "read" : "unread"}`}
              >
                <div className="flex items-start gap-3">
                  {!notif.read && (
                    <span
                      className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"
                      aria-label="Unread indicator"
                    />
                  )}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                      <h3
                        className={`font-semibold ${!notif.read ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {notif.title}
                      </h3>
                      <time
                        className="text-xs text-slate-500 flex-shrink-0"
                        dateTime={notif.createdAt}
                      >
                        {formatRelativeTime(notif.createdAt)}
                      </time>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{notif.body}</p>
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-medium"
                        aria-label={`Mark "${notif.title}" as read`}
                      >
                        <Check className="w-3 h-3" aria-hidden="true" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}