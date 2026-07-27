import { useState } from 'react';
import { Building, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

const MOCK_ORGS = [
  {
    id: 1,
    name: 'Bệnh viện Chợ Rẫy',
    type: 'HOSPITAL',
    code: 'BV-CR-001',
    address: '201B Nguyễn Chí Thanh, Q5, HCMC',
    submittedAt: '2026-07-25',
  },
  {
    id: 2,
    name: 'Trung tâm HSTW HCMC',
    type: 'MEDICAL_CENTER',
    code: 'TT-HSTW-001',
    address: '178 Pasteur, Q3, HCMC',
    submittedAt: '2026-07-26',
  },
];

export function OrganizationApprovalQueue() {
  const [orgs, setOrgs] = useState(MOCK_ORGS);

  const approve = (id: number) => {
    setOrgs(prev => prev.filter(o => o.id !== id));
  };

  const reject = (id: number) => {
    setOrgs(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Approval Queue</h1>

      {orgs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            All organizations have been reviewed!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orgs.map(org => (
            <div
              key={org.id}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span>{org.code}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                        {org.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" /> {org.address}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-400">
                      <Clock className="w-4 h-4" /> Submitted: {org.submittedAt}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(org.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => reject(org.id)}
                    className="flex items-center gap-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}