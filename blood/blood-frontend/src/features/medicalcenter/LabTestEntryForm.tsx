import { useState } from 'react';
import { useRecordLabTest } from '@/shared/api/generated/inventory-controller/inventory-controller';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { RecordLabTestRequestResult } from '@/shared/api/generated/model/recordLabTestRequestResult';

const TEST_TYPES = [
  'HIV',
  'Hepatitis B',
  'Hepatitis C',
  'Syphilis',
  'Malaria',
  'Blood Typing',
];
const RESULTS: RecordLabTestRequestResult[] = ['PASSED', 'FAILED', 'PENDING'];

export function LabTestEntryForm() {
  const navigate = useNavigate();
  const recordMutation = useRecordLabTest();
  const [form, setForm] = useState({
    unitId: '',
    testType: TEST_TYPES[0],
    result: 'PASSED' as RecordLabTestRequestResult,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.unitId) {
      toast.error('Please enter the blood unit ID');
      return;
    }
    try {
      await recordMutation.mutateAsync({
        id: parseInt(form.unitId),
        data: {
          testType: form.testType,
          result: form.result,
          notes: form.notes,
        },
      });
      toast.success('Lab test recorded successfully!');
      navigate('/medicalcenter/dashboard');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to record test'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Record Lab Test</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Blood Unit ID
          </label>
          <input
            type="number"
            value={form.unitId}
            required
            onChange={e => setForm({ ...form, unitId: e.target.value })}
            placeholder="Enter blood unit ID"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Test Type
          </label>
          <select
            value={form.testType}
            onChange={e => setForm({ ...form, testType: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
          >
            {TEST_TYPES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Result
          </label>
          <div className="flex gap-3">
            {RESULTS.map(r => (
              <label
                key={r}
                className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  form.result === r
                    ? r === 'PASSED'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : r === 'FAILED'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="result"
                  value={r}
                  checked={form.result === r}
                  onChange={e =>
                    setForm({
                      ...form,
                      result: e.target.value as RecordLabTestRequestResult,
                    })
                  }
                  className="sr-only"
                />
                {r}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional notes..."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => navigate('/medicalcenter/dashboard')}
          className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={recordMutation.isPending}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {recordMutation.isPending ? 'Saving...' : 'Save Test Result'}
        </button>
      </div>
    </form>
  );
}