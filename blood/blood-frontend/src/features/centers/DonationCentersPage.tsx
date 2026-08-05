import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  List,
  Map as MapIcon,
  Search,
  Clock,
  Phone,
  Filter,
  Navigation,
  FilterX,
  Loader2,
  ExternalLink,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePublicLocations,
  useNearbyLocations,
} from "@/shared/api/generated/donation-location-controller/donation-location-controller";
import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";

interface Center {
  id: number;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  phone?: string;
  openHours?: string;
  distance?: number;
  slug?: string;
  available?: boolean;
}

const DEFAULT_OPEN_HOURS = "07:00 - 17:00";
const DEFAULT_PHONE = "(028) 3822-1234";

function responseData<T>(response: unknown): T[] {
  const body = response as { data?: T[] | { data?: T[] } } | undefined;
  if (Array.isArray(body?.data)) return body.data;
  if (body?.data && "data" in body.data && Array.isArray(body.data.data)) {
    return body.data.data;
  }
  return [];
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function getDirectionsUrl(center: Center): string {
  const query = encodeURIComponent(`${center.name}, ${center.address}`);
  if (center.lat != null && center.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}&query=${query}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function DonationCentersPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(50);

  const { data: listResponse, isLoading: isListLoading, isError: isListError, refetch: refetchList } =
    usePublicLocations();

  const { data: nearbyResponse, isLoading: isNearbyLoading, isError: isNearbyError } = useNearbyLocations(
    {
      lat: userCoords?.lat ?? 10.7769,
      lng: userCoords?.lng ?? 106.7009,
      radiusKm: selectedRadius,
    },
    { query: { enabled: userCoords !== null } }
  );

  useEffect(() => {
    if (isListError || isNearbyError) {
      toast.error("Failed to load donation centers");
    }
  }, [isListError, isNearbyError]);

  const allCenters: Center[] = useMemo(() => {
    const apiCenters = responseData<any>(listResponse);
    return apiCenters.map((loc) => ({
      id: loc.id,
      name: loc.name || "Donation Center",
      address: loc.address || "",
      lat: loc.latitude,
      lng: loc.longitude,
      phone: DEFAULT_PHONE,
      openHours: DEFAULT_OPEN_HOURS,
      available: loc.published !== false,
      slug: loc.slug,
    }));
  }, [listResponse]);

  const nearbyCenters: Center[] = useMemo(() => {
    const apiCenters = responseData<any>(nearbyResponse);
    return apiCenters.map((item) => ({
      id: item.location?.id,
      name: item.location?.name || "Donation Center",
      address: item.location?.address || "",
      lat: item.location?.latitude,
      lng: item.location?.longitude,
      phone: DEFAULT_PHONE,
      openHours: DEFAULT_OPEN_HOURS,
      available: item.location?.published !== false,
      distance: item.distanceKm,
      slug: item.location?.slug,
    })).filter((center) => center.id != null);
  }, [nearbyResponse]);

  const centersToShow = userCoords ? nearbyCenters : allCenters;

  const filteredCenters = useMemo(() => {
    const q = normalizeSearch(searchQuery.trim());
    if (!q) return centersToShow;
    return centersToShow.filter((c) => {
      const name = normalizeSearch(c.name);
      const address = normalizeSearch(c.address);
      return name.includes(q) || address.includes(q);
    });
  }, [centersToShow, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setUserCoords(null);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Location detected — showing nearby centers");
      },
      () => toast.error("Unable to retrieve your location")
    );
  };

  const handleRefresh = () => {
    refetchList();
    toast.success("Refreshing donation centers");
  };

  const isLoading = isListLoading || (userCoords ? isNearbyLoading : false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-red-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mt-4">Find Donation Centers</h1>
          <p className="mt-2 text-red-100 max-w-2xl">
            Discover certified blood donation centers near you and book your appointment.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
              <label htmlFor="center-search" className="sr-only">
                Search centers
              </label>
              <input
                id="center-search"
                type="text"
                placeholder="Search by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            <button
              onClick={handleUseLocation}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Navigation className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Use My Location</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isListLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              aria-label="Refresh centers"
            >
              <Loader2 className={`w-5 h-5 ${isListLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters || userCoords
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
              aria-expanded={showFilters}
            >
              <Filter className="w-5 h-5" aria-hidden="true" />
              Filters
              {userCoords && <span className="w-2 h-2 bg-red-500 rounded-full" />}
            </button>

            <div className="flex bg-slate-100 rounded-xl p-1" role="tablist" aria-label="View mode">
              <button
                onClick={() => setViewMode("list")}
                role="tab"
                aria-selected={viewMode === "list"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                role="tab"
                aria-selected={viewMode === "map"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "map"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapIcon className="w-5 h-5" aria-hidden="true" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="radius-select" className="block text-sm font-medium text-slate-700 mb-2">
                    Search radius
                  </label>
                  <select
                    id="radius-select"
                    value={selectedRadius}
                    onChange={(e) => setSelectedRadius(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {[5, 10, 20, 50].map((r) => (
                      <option key={r} value={r}>
                        Within {r} km
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <FilterX className="w-5 h-5" aria-hidden="true" />
                    Clear filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-600">
            Found{" "}
            <span className="font-semibold text-slate-900">{filteredCenters.length}</span>{" "}
            donation center{filteredCenters.length === 1 ? "" : "s"}
            {userCoords && " near your location"}
          </p>
        </div>

        {isLoading ? (
          <LoadingSkeleton variant={viewMode === "map" ? "list" : "card"} rows={6} />
        ) : viewMode === "list" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCenters.map((center) => (
              <CenterCard key={center.id} center={center} />
            ))}
            {filteredCenters.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyState
                  title="No centers found"
                  description="Try adjusting your search query or clearing filters."
                  action={
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredCenters.map((center) => (
                <CompactCenterCard key={center.id} center={center} />
              ))}
              {filteredCenters.length === 0 && (
                <EmptyState
                  title="No centers found"
                  description="Try adjusting your search query."
                />
              )}
            </div>
            <div className="lg:col-span-2 bg-slate-200 rounded-2xl min-h-[500px] flex items-center justify-center overflow-hidden">
              <MapPreview centers={filteredCenters} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CenterCard({ center }: { center: Center }) {
  const mapsUrl = getDirectionsUrl(center);
  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <MapPin className="w-12 h-12 text-white opacity-60" aria-hidden="true" />
        {center.distance !== undefined && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700 inline-flex items-center gap-1">
              <Navigation className="w-3 h-3" aria-hidden="true" />
              {center.distance.toFixed(1)} km
            </span>
          </div>
        )}
        {center.available && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
              Open
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{center.name}</h3>
        <p className="text-sm text-slate-600 flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{center.address}</span>
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>{center.openHours}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <a href={`tel:${center.phone}`} className="hover:text-red-600">
              {center.phone}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            Get Directions
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <Link
            to={`/donor/book?centerId=${center.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-600 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            Book Appointment
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactCenterCard({ center }: { center: Center }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{center.name}</h3>
          <p className="text-xs text-slate-500 truncate">{center.address}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            {center.distance !== undefined && (
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3" aria-hidden="true" />
                {center.distance.toFixed(1)} km
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {center.openHours}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPreview({ centers }: { centers: Center[] }) {
  const withCoords = centers.filter((c) => c.lat != null && c.lng != null);
  if (withCoords.length === 0) {
    return (
      <div className="text-center p-8">
        <MapIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" aria-hidden="true" />
        <p className="text-slate-600 font-medium">Map View</p>
        <p className="text-sm text-slate-500 mt-1">
          No location coordinates available for the current centers.
        </p>
      </div>
    );
  }
  const center = withCoords[0];
  const bbox = withCoords
    .map((c) => `${c.lng},${c.lat}`)
    .join("%7C");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;
  return (
    <iframe
      title="Donation centers map"
      src={src}
      className="w-full h-full min-h-[500px] border-0"
      loading="lazy"
    />
  );
}
