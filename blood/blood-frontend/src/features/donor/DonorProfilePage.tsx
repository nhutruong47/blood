import { useAuth } from '@/contexts/AuthContext';
import { User, Droplet, Mail, Calendar, Bell, Loader2, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDonorSummary, getNotificationPreferences, updateNotificationPreferences } from '@/shared/api/admin-api';
import { toast } from 'sonner';

export function DonorProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['donor', 'summary'],
    queryFn: getDonorSummary,
  });

  const { data: notifPrefs } = useQuery({
    queryKey: ['donor', 'notifPrefs'],
    queryFn: getNotificationPreferences,
  });

  const updatePrefs = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor', 'notifPrefs'] });
      toast.success('Preferences updated successfully');
    },
    onError: () => toast.error('Failed to update preferences'),
  });

  const handleToggle = (key: 'emergencyAlerts' | 'email' | 'sms') => {
    if (!notifPrefs) return;
    updatePrefs.mutate({ ...notifPrefs, [key]: !notifPrefs[key] });
  };

  const bloodType =
    user?.bloodGroup?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') ?? '—';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-slate-500 flex items-center gap-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Droplet className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-red-600">{bloodType}</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading your stats...
          </div>
        ) : isError ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">Failed to load donor stats.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{summary?.totalDonations ?? '—'}</p>
              <p className="text-sm text-slate-500">Total Donations</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{summary?.livesSaved ?? '—'}</p>
              <p className="text-sm text-slate-500">Lives Saved</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-600" />
          Notification Preferences
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium">Emergency Alerts</p>
              <p className="text-sm text-slate-500">
                Receive SMS when your blood type is urgently needed
              </p>
            </div>
            <button
              onClick={() => handleToggle('emergencyAlerts')}
              role="switch"
              aria-checked={notifPrefs?.emergencyAlerts ?? false}
              disabled={updatePrefs.isPending}
              className={`w-12 h-7 rounded-full transition-colors ${
                notifPrefs?.emergencyAlerts ? 'bg-red-600' : 'bg-slate-300'
              } ${updatePrefs.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifPrefs?.emergencyAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-slate-500">
                Appointment reminders and certificates
              </p>
            </div>
            <button
              onClick={() => handleToggle('email')}
              role="switch"
              aria-checked={notifPrefs?.email ?? false}
              disabled={updatePrefs.isPending}
              className={`w-12 h-7 rounded-full transition-colors ${
                notifPrefs?.email ? 'bg-red-600' : 'bg-slate-300'
              } ${updatePrefs.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifPrefs?.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-slate-500">
                Booking confirmations and reminders
              </p>
            </div>
            <button
              onClick={() => handleToggle('sms')}
              role="switch"
              aria-checked={notifPrefs?.sms ?? false}
              disabled={updatePrefs.isPending}
              className={`w-12 h-7 rounded-full transition-colors ${
                notifPrefs?.sms ? 'bg-red-600' : 'bg-slate-300'
              } ${updatePrefs.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifPrefs?.sms ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          Donation History
        </h3>
        {!summary?.recentActivities?.length ? (
          <p className="text-slate-500 text-center py-4">No donation history yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {summary.recentActivities.map((activity) => (
              <li key={activity.id} className="flex items-start gap-4 py-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  {activity.type === 'donation' ? (
                    <Heart className="w-5 h-5 text-red-600" />
                  ) : (
                    <Calendar className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{activity.title}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(activity.date).toLocaleDateString()}
                    {activity.status && ` • ${activity.status}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
