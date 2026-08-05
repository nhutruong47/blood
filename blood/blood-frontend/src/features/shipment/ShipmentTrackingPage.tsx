import { useState, useEffect } from "react";
import { Truck, MapPin, Package, Clock, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getShipments, type ShipmentResponse } from "@/shared/api/admin-api";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";

export function ShipmentTrackingPage() {
  const [shipments, setShipments] = useState<ShipmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getShipments()
      .then((data) => {
        if (!cancelled) setShipments(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load shipments");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED": return "bg-slate-100 text-slate-700 border-slate-200";
      case "PICKED_UP": return "bg-blue-50 text-blue-700 border-blue-200";
      case "IN_TRANSIT": return "bg-amber-50 text-amber-700 border-amber-200";
      case "DELIVERED": return "bg-green-50 text-green-700 border-green-200";
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Truck className="w-8 h-8" />
            Shipment Tracking
          </h1>
          <p className="mt-2 text-slate-300">Track and manage live blood bag shipments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* List Column */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-500" />
              Active Shipments
            </h2>
            
            {isLoading ? (
              <LoadingSkeleton variant="list" rows={5} />
            ) : shipments.length === 0 ? (
              <EmptyState 
                title="No shipments" 
                description="There are currently no active shipments." 
              />
            ) : (
              <div className="space-y-3">
                {shipments.map((shipment) => (
                  <button
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedShipment?.id === shipment.id 
                        ? "border-slate-900 shadow-md ring-1 ring-slate-900" 
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900">SHP-{shipment.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                      <Phone className="w-4 h-4" />
                      {shipment.courierName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2">
            {!selectedShipment ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
                <Truck className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No Shipment Selected</h3>
                <p className="text-slate-500 mt-2">Select a shipment from the list to view its tracking history.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Shipment SHP-{selectedShipment.id}</h2>
                    <p className="text-slate-500 flex items-center gap-2 mt-1">
                      <Package className="w-4 h-4" />
                      For Request #{selectedShipment.bloodRequestId}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedShipment.status)}`}>
                      {selectedShipment.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Courier Info</p>
                    <p className="font-semibold text-slate-900">{selectedShipment.courierName}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                      <Phone className="w-4 h-4" />
                      {selectedShipment.courierPhone}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Logistics</p>
                    {selectedShipment.temperatureAtPickup && (
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">Pickup Temp:</span> {selectedShipment.temperatureAtPickup}°C
                      </p>
                    )}
                    {selectedShipment.pickedUpAt && (
                      <p className="text-sm text-slate-700 mt-1">
                        <span className="font-semibold">Picked Up:</span> {new Date(selectedShipment.pickedUpAt).toLocaleString()}
                      </p>
                    )}
                    {selectedShipment.deliveredAt && (
                      <p className="text-sm text-green-700 mt-1">
                        <span className="font-semibold">Delivered:</span> {new Date(selectedShipment.deliveredAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-4">Tracking History</h3>
                
                {selectedShipment.checkpoints.length === 0 ? (
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    No tracking updates available yet.
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {selectedShipment.checkpoints.map((checkpoint, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          {idx === selectedShipment.checkpoints.length - 1 && selectedShipment.status === "DELIVERED" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <MapPin className="w-5 h-5" />
                          )}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-slate-900">{checkpoint.location}</h4>
                            {checkpoint.temperature && (
                              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                {checkpoint.temperature}°C
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{checkpoint.description}</p>
                          <time className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(checkpoint.timestamp).toLocaleString()}
                          </time>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
