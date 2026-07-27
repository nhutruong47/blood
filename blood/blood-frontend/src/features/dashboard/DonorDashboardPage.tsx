import { Link } from "react-router-dom";
import {
  Droplet,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Award,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Activity,
  Bell,
  Settings,
} from "lucide-react";

const MOCK_USER = {
  name: "Nguyen Van A",
  email: "nguyenvana@email.com",
  bloodType: "O+",
  donationCount: 5,
  nextEligibleDate: "2026-08-15",
  livesSaved: 15,
  impactScore: 85,
  badges: [
    { name: "First Donation", icon: "🎉", date: "2024-01-15" },
    { name: "5 Donations", icon: "⭐", date: "2024-06-20" },
    { name: "Emergency Hero", icon: "🚨", date: "2025-03-10" },
  ],
  appointments: [
    {
      id: 1,
      date: "2026-08-10",
      time: "09:00",
      center: "Blood Center - HCMC",
      status: "confirmed",
    },
  ],
  recentActivity: [
    { type: "donation", message: "Donated blood at Blood Center HCMC", date: "2 weeks ago" },
    { type: "appointment", message: "Appointment confirmed for August 10", date: "3 days ago" },
    { type: "badge", message: "Earned Emergency Hero badge", date: "2 months ago" },
  ],
};

const BLOOD_INVENTORY = [
  { type: "O+", units: 120, status: "good" },
  { type: "A+", units: 85, status: "moderate" },
  { type: "B+", units: 95, status: "good" },
  { type: "AB+", units: 45, status: "low" },
  { type: "O-", units: 25, status: "critical" },
  { type: "A-", units: 30, status: "moderate" },
];

export function DonorDashboardPage() {
  const user = MOCK_USER;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold">Welcome back, {user.name}!</h1>
                <p className="text-red-100 flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Blood Type: {user.bloodType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Droplet className="w-6 h-6" />}
                label="Donations"
                value={user.donationCount}
                subtext="Total donations"
                color="red"
              />
              <StatCard
                icon={<Heart className="w-6 h-6" />}
                label="Lives Saved"
                value={user.livesSaved}
                subtext="People helped"
                color="pink"
              />
              <StatCard
                icon={<Award className="w-6 h-6" />}
                label="Impact Score"
                value={user.impactScore}
                subtext="Keep it up!"
                color="yellow"
              />
            </div>

            {/* Quick Actions */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/eligibility"
                  className="flex items-center gap-4 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Check Eligibility</p>
                    <p className="text-sm text-slate-600">Quick health check</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
                <Link
                  to="/centers"
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Find Centers</p>
                    <p className="text-sm text-slate-600">Nearby locations</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
                <Link
                  to="/book"
                  className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Book Appointment</p>
                    <p className="text-sm text-slate-600">Schedule donation</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
                <Link
                  to="/history"
                  className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">View History</p>
                    <p className="text-sm text-slate-600">Your donations</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </Link>
              </div>
            </section>

            {/* Upcoming Appointment */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Upcoming Appointment</h2>
                <Link to="/appointments" className="text-sm text-red-600 hover:text-red-700 font-medium">
                  View All
                </Link>
              </div>
              {user.appointments.length > 0 ? (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-600 rounded-xl flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-bold">{user.appointments[0].date.split("-")[2]}</span>
                    <span className="text-xs">{user.appointments[0].date.split("-")[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{user.appointments[0].center}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {user.appointments[0].time}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Confirmed
                  </span>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">No upcoming appointments</p>
                  <Link
                    to="/centers"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </section>

            {/* Blood Inventory Status */}
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Blood Inventory Status</h2>
              <p className="text-sm text-slate-600 mb-4">
                Current supply levels at nearby centers. Your donations make a difference!
              </p>
              <div className="space-y-3">
                {BLOOD_INVENTORY.map((blood) => (
                  <div key={blood.type} className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                        blood.type.includes("-") ? "bg-red-600" : "bg-red-500"
                      }`}
                    >
                      {blood.type}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">{blood.type} Units</span>
                        <span className="text-sm text-slate-600">{blood.units} units</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            blood.status === "critical"
                              ? "bg-red-600"
                              : blood.status === "low"
                              ? "bg-orange-500"
                              : blood.status === "moderate"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min((blood.units / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {blood.status === "critical" && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Critical
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Your blood type ({user.bloodType}) is in high demand. Thank you for considering donating!
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Eligible Date */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-3">Next Eligible Date</h3>
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-5 h-5" />
                <span>{user.nextEligibleDate}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                84 days after your last donation
              </p>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">Your Badges</h3>
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                    title={`${badge.name} - Earned ${badge.date}`}
                  >
                    {badge.icon}
                  </div>
                ))}
              </div>
              <Link
                to="/badges"
                className="mt-4 flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                View All Badges
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {user.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "donation"
                          ? "bg-red-100 text-red-600"
                          : activity.type === "appointment"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {activity.type === "donation" ? (
                        <Droplet className="w-4 h-4" />
                      ) : activity.type === "appointment" ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-900">{activity.message}</p>
                      <p className="text-xs text-slate-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency CTA */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">Emergency Alert</h3>
              </div>
              <p className="text-sm text-red-100 mb-4">
                There is an urgent need for {user.bloodType} blood. Your donation can save lives.
              </p>
              <Link
                to="/emergency"
                className="block w-full text-center px-4 py-2 bg-white text-red-700 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    red: "bg-red-100 text-red-600",
    pink: "bg-pink-100 text-pink-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{subtext}</p>
    </div>
  );
}
