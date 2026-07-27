import { useState } from 'react';
import { AlertTriangle, Phone, MapPin, Users, Clock, CheckCircle } from 'lucide-react';

const MOCK_EMERGENCIES = [
  {
    id: 1,
    bloodType: 'O-',
    units: 4,
    urgency: 'CRITICAL',
    status: 'MATCHING_DONOR',
    center: 'Cho Ray Hospital',
    createdAt: '2026-07-27T09:00:00Z',
    donorsAlerted: 20,
    donorsResponded: 3,
  },
  {
    id: 2,
    bloodType: 'AB+',
    units: 2,
    urgency: 'HIGH',
    status: 'RESERVED',
    center: 'BVND TU',
    createdAt: '2026-07-27T08:00:00Z',
    donorsAlerted: 0,
    donorsResponded: 0,
  },
];

const STATUS_COLORS: Record<string, string> = {
  MATCHING_DONOR: 'bg-orange-100 text-orange-700',
  RESERVED: 'bg-green-100 text-green-700',
  DISPATCHING: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-purple-100 text-purple-700',
};

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  LOW: 'bg-slate-400 text-white',
};

export function EmergencyConsole() {
  const [emergencies] = useState(MOCK_EMERGENCIES);
  const active = emergencies.filter(e => e.status !== 'DELIVERED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">Emergency Console</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {active.length} Active
        </div>
      </div>

      {emergencies.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No active emergencies!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emergencies.map(em => (
            <div
              key={em.id}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-red-600 text-white rounded-xl flex items-center justify-center text-xl font-bold">
                    {em.bloodType.replace('-', '\n')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${URGENCY_COLORS[em.urgency]}`}
                      >
                        {em.urgency}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[em.status]}`}
                      >
                        {em.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span>{em.units} units needed</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {em.center}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(em.createdAt).toLocaleTimeString()}
                  </div>
                  <p className="text-xs text-slate-400">ID: #{em.id}</p>
                </div>
              </div>

              {em.status === 'MATCHING_DONOR' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-700">
                      <Users className="w-6 h-6" /> {em.donorsAlerted}
                    </div>
                    <p className="text-sm text-orange-600">Donors Alerted</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-700">
                      <Phone className="w-6 h-6" /> {em.donorsResponded}
                    </div>
                    <p className="text-sm text-green-600">Responded</p>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm">
                      Send Reminder
                    </button>
                    <button className="flex-1 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-100 font-medium text-sm">
                      View All Matches
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}