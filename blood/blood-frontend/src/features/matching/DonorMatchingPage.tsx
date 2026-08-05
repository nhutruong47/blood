import { useState } from "react";
import { Users, Droplets, ArrowRight, ShieldCheck, Activity, Search } from "lucide-react";
import { toast } from "sonner";
import { useGetPendingRequests } from "@/shared/api/generated/blood-request-controller/blood-request-controller";
import { getRecommendations, type DonorMatchResponse } from '@/shared/api/admin-api';
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";

export function DonorMatchingPage() {
  const { data: requestsData, isLoading: isLoadingRequests } = useGetPendingRequests();
  const requests = ((requestsData?.data as any)?.data as any[]) || [];
  
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [matches, setMatches] = useState<DonorMatchResponse[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const handleMatch = async (requestId: number) => {
    setSelectedRequestId(requestId);
    setIsMatching(true);
    try {
      const data = await getRecommendations(requestId, 10);
      setMatches(data);
    } catch (err) {
      toast.error("Failed to find donor matches");
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8" />
            Donor Matching
          </h1>
          <p className="mt-2 text-red-100">Find the best matching donors for pending blood requests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Requests Column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-red-500" />
              Pending Requests
            </h2>
            
            {isLoadingRequests ? (
              <LoadingSkeleton variant="list" rows={3} />
            ) : requests.length === 0 ? (
              <EmptyState 
                title="No Pending Requests" 
                description="There are currently no blood requests needing donors." 
              />
            ) : (
              <div className="space-y-4">
                {requests.map((req: any) => (
                  <div 
                    key={req.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      selectedRequestId === req.id 
                        ? "border-red-500 bg-red-50" 
                        : "border-slate-200 hover:border-red-300 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">Request #{req.id}</p>
                        <p className="text-sm text-slate-500">
                          Blood Group: <span className="font-medium text-red-600">{req.bloodGroup}</span>
                        </p>
                        <p className="text-sm text-slate-500">
                          Priority: {req.priority}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMatch(req.id!)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium shadow-sm"
                      >
                        <Search className="w-4 h-4" />
                        Find Matches
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matches Column */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Match Results
            </h2>
            
            {!selectedRequestId ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-center border-2 border-dashed border-slate-200 rounded-xl">
                Select a request on the left to find matching donors
              </div>
            ) : isMatching ? (
              <LoadingSkeleton variant="list" rows={4} />
            ) : matches.length === 0 ? (
              <EmptyState 
                title="No matches found" 
                description="Could not find any suitable donors for this request." 
              />
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.donorId} className="p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{match.donorName}</h3>
                        <p className="text-sm text-slate-500">
                          Blood Group: <span className="font-medium text-red-600">{match.bloodGroup}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                          <Activity className="w-3 h-3" />
                          Score: {match.priorityScore}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg">
                      <p>Blood Match Score: {match.bloodGroupScore}</p>
                      <p>Availability Score: {match.availabilityScore}</p>
                      <p>Health Score: {match.healthScore}</p>
                      <p className="italic mt-1 text-slate-500">"{match.reason}"</p>
                    </div>

                    <button className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                      Notify Donor
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
