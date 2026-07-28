import { useState } from 'react';
import { MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePublicLocations } from '@/shared/api/generated/donation-location-controller/donation-location-controller';
import { useRegisterDonation } from '@/shared/api/generated/donation-controller/donation-controller';

const BLOOD_TYPES = [
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
] as const;

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const { data: locationsResponse, isLoading: isLocationsLoading } = usePublicLocations();
  const registerMutation = useRegisterDonation();

  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bloodType, setBloodType] = useState('');

  const locations = ((locationsResponse?.data as any)?.data as any[]) || [];

  const handleSubmit = async () => {
    if (!selectedLocation || !selectedDate || !bloodType) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await registerMutation.mutateAsync({
        data: {
          medicalCenterName: selectedLocation.name,
          donationDate: selectedDate,
          bloodGroup: bloodType as any,
          healthStatus: 'Self-declared via booking',
          weight: 65,
          amount: 450,
          age: 30,
        },
      });
      toast.success(
        'Appointment booked successfully! You will receive a confirmation shortly.'
      );
      navigate('/donor/dashboard');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          'Could not book appointment. Please try again later.'
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Book a Donation Appointment</h1>

      <div className="flex items-center gap-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= s ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  step > s ? 'bg-red-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Step 1: Select Blood Type</h2>
            <div className="grid grid-cols-4 gap-3">
              {BLOOD_TYPES.map(bt => (
                <button
                  key={bt.value}
                  onClick={() => setBloodType(bt.value)}
                  className={`p-4 rounded-xl border-2 font-bold transition-all ${
                    bloodType === bt.value
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {bt.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => bloodType && setStep(2)}
                disabled={!bloodType}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Next: Select Location
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Step 2: Select Donation Center</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {isLocationsLoading ? (
                <p className="text-slate-500 text-center py-8">Loading centers…</p>
              ) : locations.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No donation centers available.
                </p>
              ) : (
                locations.map((loc: any) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedLocation?.id === loc.id
                        ? 'border-red-600 bg-red-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{loc.name}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {loc.address}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedLocation}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Next: Select Date & Time
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Step 3: Select Date & Time</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select time</option>
                  <option value="07:00">07:00 - 09:00</option>
                  <option value="09:00">09:00 - 11:00</option>
                  <option value="11:00">11:00 - 13:00</option>
                  <option value="13:00">13:00 - 15:00</option>
                  <option value="15:00">15:00 - 17:00</option>
                </select>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-2">Appointment Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                <span>Blood Type:</span>
                <span className="font-medium">
                  {BLOOD_TYPES.find(b => b.value === bloodType)?.label}
                </span>
                <span>Location:</span>
                <span className="font-medium">{selectedLocation?.name}</span>
                <span>Date:</span>
                <span className="font-medium">{selectedDate}</span>
                <span>Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={registerMutation.isPending}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Confirm Booking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
