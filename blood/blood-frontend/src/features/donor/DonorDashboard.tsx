import { Calendar, Droplet, Award, Bell, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emergencyOptIn, setEmergencyOptIn] = useState(true);
  const bloodType = user?.bloodGroup?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') || '—';

  const handleDownloadCertificate = () => {
    toast.info('Certificate download will be available soon.');
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Droplet className="w-6 h-6" />}
          label="Total Donations"
          value="—"
          subtext="Donation history endpoint pending"
          color="red"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Lives Saved"
          value="—"
          subtext="Impact endpoint pending"
          color="yellow"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Next Eligible"
          value="—"
          subtext="Schedule endpoint pending"
          color="blue"
        />
      </div>

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
            onClick={() => setEmergencyOptIn(!emergencyOptIn)}
            role="switch"
            aria-checked={emergencyOptIn}
            className={`w-12 h-7 rounded-full transition-colors ${
              emergencyOptIn ? 'bg-red-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                emergencyOptIn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Preferences are stored locally. Backend sync endpoint pending.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Donation History</h2>
        <p className="text-slate-500 text-center py-4">No donation history yet.</p>
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
