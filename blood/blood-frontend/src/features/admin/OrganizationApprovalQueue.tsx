import { Building, CheckCircle, XCircle, Clock, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAll as useAllOrganizations,
  useVerify as useVerifyOrganization,
} from '@/shared/api/generated/organization-controller/organization-controller';

export function OrganizationApprovalQueue() {
  const { data, isLoading, isError, refetch } = useAllOrganizations({
    query: { refetchInterval: 60_000 },
  });
  const verifyMutation = useVerifyOrganization();

  const allOrgs: any[] = (data?.data as any)?.data ?? [];
  // Only show orgs that are still awaiting verification.
  const orgs = allOrgs.filter(
    (o) => o.status === 'PENDING_VERIFICATION' || o.status === 'PENDING'
  );

  const approve = async (id: number) => {
    try {
      await verifyMutation.mutateAsync({ id });
      toast.success('Organization approved');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to approve organization');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Approval Queue</h1>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Loading pending organizations…
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
          Failed to load organizations. Please try again.
        </div>
      ) : orgs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            All organizations have been reviewed!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orgs.map((org: any) => (
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
                      <MapPin className="w-4 h-4" /> {org.address ?? '—'}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      Submitted:{' '}
                      {org.createdAt
                        ? new Date(org.createdAt).toLocaleDateString()
                        : '—'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(org.id)}
                    disabled={verifyMutation.isPending}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-60"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    disabled
                    className="flex items-center gap-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium opacity-60 cursor-not-allowed"
                    title="Reject endpoint pending"
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
