import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRequest1 } from '@/shared/api/generated/blood-request-controller/blood-request-controller';
import { toast } from 'sonner';
import type { CreateBloodRequestRequestBloodGroup } from '@/shared/api/generated/model/createBloodRequestRequestBloodGroup';
import type { CreateBloodRequestRequestUrgency } from '@/shared/api/generated/model/createBloodRequestRequestUrgency';
import type { CreateBloodRequestRequestComponentType } from '@/shared/api/generated/model/createBloodRequestRequestComponentType';

const BLOOD_TYPES: CreateBloodRequestRequestBloodGroup[] = [
  'O_NEGATIVE',
  'O_POSITIVE',
  'A_NEGATIVE',
  'A_POSITIVE',
  'B_NEGATIVE',
  'B_POSITIVE',
  'AB_NEGATIVE',
  'AB_POSITIVE',
];
const URGENCY: CreateBloodRequestRequestUrgency[] = ['ROUTINE', 'URGENT', 'EMERGENCY'];
const COMPONENTS: CreateBloodRequestRequestComponentType[] = [
  'WHOLE_BLOOD',
  'RBC',
  'PLASMA',
  'PLATELET',
  'FFP',
  'CRYOPRECIPITATE',
];

interface FormState {
  bloodGroup: CreateBloodRequestRequestBloodGroup;
  componentType: CreateBloodRequestRequestComponentType;
  quantityUnits: number;
  urgency: CreateBloodRequestRequestUrgency;
  recipientInfo: string;
  notes: string;
}

export function HospitalRequestForm() {
  const navigate = useNavigate();
  const createMutation = useCreateRequest1();
  const [form, setForm] = useState<FormState>({
    bloodGroup: 'O_POSITIVE',
    componentType: 'WHOLE_BLOOD',
    quantityUnits: 1,
    urgency: 'ROUTINE',
    recipientInfo: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientInfo) {
      toast.error('Please provide patient information');
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: {
          bloodGroup: form.bloodGroup,
          urgency: form.urgency,
          recipientInfo: form.recipientInfo,
          componentType: form.componentType,
          quantityUnits: form.quantityUnits,
        },
      });
      toast.success('Blood request submitted successfully!');
      navigate('/hospital/dashboard');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to submit request'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Blood Request</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Blood Type
            </label>
            <select
              value={form.bloodGroup}
              onChange={e =>
                setForm({ ...form, bloodGroup: e.target.value as CreateBloodRequestRequestBloodGroup })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
            >
              {BLOOD_TYPES.map(bt => (
                <option key={bt} value={bt}>
                  {bt.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Component Type
            </label>
            <select
              value={form.componentType}
              onChange={e =>
                setForm({
                  ...form,
                  componentType: e.target.value as CreateBloodRequestRequestComponentType,
                })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
            >
              {COMPONENTS.map(c => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Units Required
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={form.quantityUnits}
              onChange={e =>
                setForm({ ...form, quantityUnits: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Urgency
            </label>
            <select
              value={form.urgency}
              onChange={e =>
                setForm({ ...form, urgency: e.target.value as CreateBloodRequestRequestUrgency })
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
            >
              {URGENCY.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Patient Information *
            </label>
            <textarea
              rows={3}
              value={form.recipientInfo}
              required
              onChange={e => setForm({ ...form, recipientInfo: e.target.value })}
              placeholder="Patient ID, diagnosis, department, treating physician..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => navigate('/hospital/dashboard')}
          className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}