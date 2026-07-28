import { useAuth } from '@/contexts/AuthContext';
import { User, Droplet, Mail, Calendar, Bell } from 'lucide-react';
import { useState } from 'react';

export function DonorProfilePage() {
  const { user } = useAuth();
  const [emergencyOptIn, setEmergencyOptIn] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

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

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-bold text-slate-900">—</p>
            <p className="text-sm text-slate-500">Total Donations</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-3xl font-bold text-slate-900">—</p>
            <p className="text-sm text-slate-500">Lives Saved</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          Donation statistics endpoint pending — backend exposes DonationRegistration but not the donor-summary aggregation yet.
        </p>
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

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-slate-500">
                Appointment reminders and certificates
              </p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              role="switch"
              aria-checked={emailNotifications}
              className={`w-12 h-7 rounded-full transition-colors ${
                emailNotifications ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
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
              onClick={() => setSmsNotifications(!smsNotifications)}
              role="switch"
              aria-checked={smsNotifications}
              className={`w-12 h-7 rounded-full transition-colors ${
                smsNotifications ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Preferences are stored locally. Backend sync endpoint pending.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          Donation History
        </h3>
        <p className="text-slate-500 text-center py-4">No donation history yet.</p>
      </div>
    </div>
  );
}
