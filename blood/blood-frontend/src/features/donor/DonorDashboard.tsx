import { Calendar, Droplet, Award, Bell, Download, Loader2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDonorSummary, getNotificationPreferences, updateNotificationPreferences } from '@/shared/api/admin-api';
import { generateCertificate } from '@/shared/utils/certificate';

export function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bloodType = user?.bloodGroup?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') || '—';

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

  const handleToggleEmergency = () => {
    if (!notifPrefs) return;
    updatePrefs.mutate({ ...notifPrefs, emergencyAlerts: !notifPrefs.emergencyAlerts });
  };

  const handleDownloadCertificate = () => {
    if (!summary || summary.totalDonations === 0) {
      toast.error('You need at least one donation to generate a certificate.');
      return;
    }
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Hero';
    generateCertificate(name, summary.totalDonations, bloodType);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.firstName?.charAt(0) || 'D'}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              Welcome, {user?.firstName} {user?.lastName}!
            </h1>
            <p className="text-red-100 flex items-center gap-2 mt-1">
              <Droplet className="w-4 h-4" />
              Blood Type: <span className="font-semibold">{bloodType}</span>
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading your stats...
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">Failed to load donor stats.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Droplet className="w-6 h-6" />}
            label="Total Donations"
            value={summary?.totalDonations ?? '—'}
            subtext="Lifetime contributions"
            color="red"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Lives Saved"
            value={summary?.livesSaved ?? '—'}
            subtext="Estimated impact"
            color="yellow"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Next Eligible"
            value={summary?.nextEligibleDate ? new Date(summary.nextEligibleDate).toLocaleDateString() : '—'}
            subtext="Based on last donation"
            color="blue"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <button
              onClick={() => navigate('/donor/book')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Book Appointment
            </button>
          </div>
          <p className="text-slate-500 text-center py-8">No upcoming appointments.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Badges & Certificates</h2>
          <p className="text-slate-500 text-center py-4">No badges earned yet.</p>
          <button
            onClick={handleDownloadCertificate}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Download Latest Certificate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-slate-600" />
            <div>
              <p className="font-medium">Emergency Matching Opt-in</p>
              <p className="text-sm text-slate-500">
                Receive SMS alerts when your blood type is urgently needed
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleEmergency}
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
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Donation History</h2>
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

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div
        className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{subtext}</p>
    </div>
  );
}
