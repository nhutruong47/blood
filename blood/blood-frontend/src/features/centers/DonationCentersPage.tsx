import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  List,
  Map as MapIcon,
  Search,
  Clock,
  Phone,
  Star,
  Filter,
  Navigation,
  Calendar,
  FilterX,
} from "lucide-react";

const MOCK_CENTERS = [
  {
    id: 1,
    name: "Blood Center - Ho Chi Minh City",
    address: "123 Nguyen Hue Street, District 1",
    city: "Ho Chi Minh City",
    lat: 10.7769,
    lng: 106.7009,
    phone: "028-3822-1234",
    rating: 4.8,
    reviews: 234,
    openHours: "07:00 - 17:00",
    distance: 1.2,
    nextSlot: "Today 2:00 PM",
    bloodTypes: ["O+", "A+", "B+", "AB+"],
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Hospital Blood Bank - District 5",
    address: "456 Tran Phu Street, District 5",
    city: "Ho Chi Minh City",
    lat: 10.7550,
    lng: 106.6540,
    phone: "028-3855-5678",
    rating: 4.6,
    reviews: 156,
    openHours: "08:00 - 16:00",
    distance: 3.5,
    nextSlot: "Tomorrow 9:00 AM",
    bloodTypes: ["O-", "A-", "B-", "AB-"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Red Cross Donation Center",
    address: "789 Le Dai Hanh Street, District 11",
    city: "Ho Chi Minh City",
    lat: 10.7650,
    lng: 106.6400,
    phone: "028-3858-9999",
    rating: 4.9,
    reviews: 412,
    openHours: "07:30 - 17:30",
    distance: 5.1,
    nextSlot: "Today 4:00 PM",
    bloodTypes: ["O+", "A+", "B+", "AB+", "O-", "A-"],
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "City Hospital Blood Center",
    address: "321 Nguyen Tri Phuong, District 10",
    city: "Ho Chi Minh City",
    lat: 10.7720,
    lng: 106.6750,
    phone: "028-3853-2222",
    rating: 4.5,
    reviews: 98,
    openHours: "08:00 - 15:00",
    distance: 2.8,
    nextSlot: "Today 3:30 PM",
    bloodTypes: ["A+", "B+", "AB+"],
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop",
  },
];

const BLOOD_TYPES = ["All", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const DISTANCES = [
  { value: 5, label: "Within 5 km" },
  { value: 10, label: "Within 10 km" },
  { value: 20, label: "Within 20 km" },
  { value: 50, label: "Within 50 km" },
];

export function DonationCentersPage() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState(50);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCenters = MOCK_CENTERS.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBloodType =
      selectedBloodType === "All" || center.bloodTypes.includes(selectedBloodType);
    const matchesDistance = center.distance <= selectedDistance;
    return matchesSearch && matchesBloodType && matchesDistance;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBloodType("All");
    setSelectedDistance(50);
  };

  const hasActiveFilters =
    searchQuery || selectedBloodType !== "All" || selectedDistance !== 50;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold">Find Donation Centers</h1>
          <p className="mt-2 text-red-100">
            Discover certified blood donation centers near you and book your appointment
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, address, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-5 h-5" />
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === "map"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapIcon className="w-5 h-5" />
                Map
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Blood Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Type Needed
                  </label>
                  <select
                    value={selectedBloodType}
                    onChange={(e) => setSelectedBloodType(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {BLOOD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type === "All" ? "All Blood Types" : `Type ${type}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Distance Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maximum Distance
                  </label>
                  <select
                    value={selectedDistance}
                    onChange={(e) => setSelectedDistance(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {DISTANCES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <FilterX className="w-5 h-5" />
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Found <span className="font-semibold text-slate-900">{filteredCenters.length}</span> donation centers
            {hasActiveFilters && " with your filters"}
          </p>
        </div>

        {viewMode === "list" ? (
          /* List View */
          <div className="grid gap-6">
            {filteredCenters.map((center) => (
              <CenterCard key={center.id} center={center} />
            ))}

            {filteredCenters.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No centers found</h3>
                <p className="text-slate-600 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Map View */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Center List */}
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              {filteredCenters.map((center) => (
                <CenterCard key={center.id} center={center} compact />
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="lg:col-span-2 bg-slate-200 rounded-2xl min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Map View</p>
                <p className="text-sm text-slate-500">Interactive map would display here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CenterCard({
  center,
  compact = false,
}: {
  center: (typeof MOCK_CENTERS)[0];
  compact?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all ${
        compact ? "p-4" : ""
      }`}
    >
      {compact ? (
        /* Compact Card for Map View */
        <div className="flex gap-4">
          <img
            src={center.image}
            alt={center.name}
            className="w-24 h-24 object-cover rounded-xl"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{center.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{center.address}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-slate-600">
                <Navigation className="w-4 h-4" />
                {center.distance} km
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-4 h-4" />
                {center.openHours}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Full Card */
        <>
          <div className="relative h-48">
            <img
              src={center.image}
              alt={center.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700 flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                {center.distance} km away
              </span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-yellow-400 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              {center.rating}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900">{center.name}</h3>
            <p className="text-slate-600 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {center.address}, {center.city}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {center.bloodTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium"
                >
                  {type}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Open Hours</p>
                  <p className="text-sm">{center.openHours}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium">Next Slot</p>
                  <p className="text-sm text-green-600">{center.nextSlot}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-slate-600">
              <Phone className="w-5 h-5 text-slate-400" />
              <span>{center.phone}</span>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to={`/centers/${center.id}`}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold text-center hover:bg-red-700 transition-colors"
              >
                View Details
              </Link>
              <Link
                to={`/book/${center.id}`}
                className="flex-1 px-4 py-3 border border-red-600 text-red-600 rounded-xl font-semibold text-center hover:bg-red-50 transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
