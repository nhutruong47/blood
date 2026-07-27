import { Bell, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface Notification {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Emergency Request',
    body: 'Your blood type (O+) is urgently needed at Cho Ray Hospital.',
    createdAt: '2026-07-27T10:00:00Z',
    read: false,
  },
  {
    id: 2,
    title: 'Appointment Reminder',
    body: 'Your donation appointment is tomorrow at 9:00 AM.',
    createdAt: '2026-07-26T15:00:00Z',
    read: false,
  },
  {
    id: 3,
    title: 'Certificate Issued',
    body: 'Your donation certificate has been generated.',
    createdAt: '2026-07-25T09:00:00Z',
    read: true,
  },
];

export function NotificationInbox() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
              {unread} unread
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No notifications</div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 hover:bg-slate-50 transition-colors ${
                !notif.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {!notif.read && (
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`font-semibold ${
                        !notif.read ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{notif.body}</p>
                  {!notif.read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}