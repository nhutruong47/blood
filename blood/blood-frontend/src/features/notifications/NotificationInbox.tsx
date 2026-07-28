import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Droplet,
  AlertCircle,
  Calendar,
  Settings,
  Inbox,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatRelativeTime } from "@/shared/utils/format";
import {
  getMyNotifications,
  markNotificationRead,
  type AdminNotification,
} from "@/shared/api/admin-api";

type NotificationType = "request" | "emergency" | "appointment" | "system";

interface Notification extends AdminNotification {
  read: boolean;
  type: NotificationType;
}

function mapType(channel?: string | null, referenceType?: string | null): NotificationType {
  if (referenceType === "BLOOD_REQUEST") return "request";
  if (referenceType === "EMERGENCY") return "emergency";
  if (referenceType === "APPOINTMENT" || referenceType === "SCHEDULE") return "appointment";
  if ((channel ?? "").toUpperCase().includes("EMERGENCY")) return "emergency";
  return "system";
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

export function NotificationInbox() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: getMyNotifications,
    refetchInterval: 30_000,
  });
  const readMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", "me"] }),
    onError: () => toast.error("Could not mark notification as read"),
  });

  // Backend only stores `status`; we treat SENT as "read" client-side.
  const notifications: Notification[] = useMemo(() => {
    return (data ?? []).map(n => ({
      ...n,
      read: n.status === "SENT",
      type: mapType(n.channel, n.referenceType),
    }));
  }, [data]);

  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const counts: Record<FilterType, number> = {
    all: notifications.length,
    unread: unreadCount,
    request: notifications.filter(n => n.type === "request").length,
    emergency: notifications.filter(n => n.type === "emergency").length,
    appointment: notifications.filter(n => n.type === "appointment").length,
    system: notifications.filter(n => n.type === "system").length,
  };

  const markAllRead = () => {
    notifications.filter(n => !n.read).forEach(n => readMutation.mutate(n.id));
  };

  return (
    <div className="space-y-6">
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
        {(Object.keys(FILTER_LABELS) as FilterType[]).map(f => {
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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 inline-flex gap-2 items-center justify-center w-full">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading notifications…
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
          Could not load notifications.
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="You will see booking confirmations, emergency alerts and certificates here."
          icon={<Inbox className="w-8 h-8 text-slate-400" aria-hidden="true" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filtered.map(notif => {
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
                      onClick={() => readMutation.mutate(notif.id)}
                      disabled={readMutation.isPending}
                      className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
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