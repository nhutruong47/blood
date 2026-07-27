import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  Building2,
  Calendar,
  Download,
  Droplet,
  Edit,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AXIOS_INSTANCE } from "@/shared/api/axios-instance";
import { formatBloodGroup } from "@/shared/constants/bloodGroups";

interface ActivityEntry {
  id: string;
  type: "donation" | "request" | "certificate" | "appointment";
  title: string;
  date: string;
  status?: string;
}

interface UserProfile {
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  address?: string | null;
  emergencyAlertOptIn?: boolean;
  lastDonationDate?: string | null;
  nextEligibleDate?: string | null;
}

const SAMPLE_TIMELINE: ActivityEntry[] = [
  {
    id: "a-1",
    type: "donation",
    title: "Whole blood donation - Blood Center District 1",
    date: "2026-04-12",
    status: "Completed",
  },
  {
    id: "a-2",
    type: "certificate",
    title: "Certificate of Achievement issued",
    date: "2026-04-12",
  },
  {
    id: "a-3",
    type: "appointment",
    title: "Scheduled appointment at Cho Ray Hospital",
    date: "2026-08-04",
    status: "Confirmed",
  },
  {
    id: "a-4",
    type: "request",
    title: "Emergency request fulfilled",
    date: "2026-02-27",
    status: "Matched",
  },
];

const ACTIVITY_ICONS: Record<ActivityEntry["type"], React.ComponentType<{ className?: string }>> = {
  donation: Heart,
  request: Activity,
  certificate: Award,
  appointment: Calendar,
};

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    AXIOS_INSTANCE.get("/api/profile")
      .then((response) => {
        if (!cancelled) {
          setProfile(response.data?.data ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    const today = new Date();
    const lastDonation = new Date("2026-04-12");
    const nextEligible = addDays(lastDonation, 90);
    const daysUntilEligible = Math.max(
      0,
      Math.round((nextEligible.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    );
    return {
      totalDonations: 7,
      lastDonation: formatDate(lastDonation),
      nextEligible: formatDate(nextEligible),
      daysUntilEligible,
      livesSaved: 21,
    };
  }, []);

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((part) => String(part).charAt(0).toUpperCase())
      .join("") || "U";

  const bloodType = formatBloodGroup(user?.bloodGroup, "short");

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your personal information, donation impact, and recent activity at a glance.
          </p>
        </div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <Edit className="w-4 h-4" aria-hidden="true" />
          Edit profile
        </Link>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-28 sm:h-32 bg-gradient-to-r from-red-600 via-red-700 to-rose-700" aria-hidden="true" />
        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-red-600" aria-label={`${user?.firstName} ${user?.lastName}`}>
                {initials}
              </span>
            </div>
          </div>
          <div className="flex-1 pt-4 sm:pt-6">
            <h2 className="text-xl font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-slate-500 capitalize">{user?.role?.toLowerCase().replace(/_/g, " ") || "member"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
              <Droplet className="w-4 h-4" aria-hidden="true" />
              {bloodType}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge(user?.status)}`}>
              {user?.status ?? "Active"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <header className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-600" aria-hidden="true" /> Personal information
            </h3>
          </header>
          <dl className="divide-y divide-slate-100">
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user?.email} />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profile?.phone} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of birth" value={profile?.birthDate} />
            <InfoRow
              icon={<MapPin className="w-4 h-4" />}
              label="Address"
              value={profile?.address}
            />
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Emergency alerts"
              value={profile?.emergencyAlertOptIn ? "Enabled" : "Disabled"}
            />
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Account status"
              value={user?.status ?? "Active"}
            />
            <InfoRow
              icon={<Building2 className="w-4 h-4" />}
              label="Member since"
              value={formatDate(new Date())}
            />
          </dl>
        </section>

        <aside className="space-y-6">
          <DonationStats stats={stats} />
          <CertificatePanel />
        </aside>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <header className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-600" aria-hidden="true" /> Recent activity
          </h3>
          <Link to="/notifications" className="text-sm text-red-600 hover:text-red-700 font-medium">
            View all
          </Link>
        </header>
        <ol className="divide-y divide-slate-100">
          {SAMPLE_TIMELINE.map((entry) => {
            const Icon = ACTIVITY_ICONS[entry.type];
            return (
              <li key={entry.id} className="flex items-start gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-red-600" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{entry.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(new Date(entry.date))}
                    {entry.status ? ` • ${entry.status}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function statusBadge(status: string | undefined): string {
  const upper = (status ?? "").toUpperCase();
  if (upper === "ACTIVE" || upper === "VERIFIED") return "bg-green-100 text-green-700";
  if (upper === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (upper === "SUSPENDED" || upper === "BANNED") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-900 truncate">{value ?? "Not provided"}</dd>
      </div>
    </div>
  );
}

function DonationStats({
  stats,
}: {
  stats: { totalDonations: number; lastDonation: string; nextEligible: string; daysUntilEligible: number; livesSaved: number };
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <header className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-600" aria-hidden="true" /> Donation impact
        </h3>
      </header>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Total donations" value={stats.totalDonations.toString()} tone="red" />
          <StatTile label="Lives saved" value={stats.livesSaved.toString()} tone="rose" />
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <p className="text-slate-500">Last donation</p>
          <p className="font-medium text-slate-900">{stats.lastDonation}</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm">
          <p className="text-green-700">Next eligible date</p>
          <p className="font-medium text-green-900">{stats.nextEligible}</p>
          <p className="text-xs text-green-700 mt-1">
            {stats.daysUntilEligible > 0
              ? `${stats.daysUntilEligible} days from now`
              : "You are eligible to donate now!"}
          </p>
        </div>
      </div>
    </section>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: "red" | "rose" }) {
  const palette =
    tone === "red" ? "from-red-50 to-red-100 text-red-700" : "from-rose-50 to-rose-100 text-rose-700";
  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br ${palette}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}

function CertificatePanel() {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <header className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-600" aria-hidden="true" /> Certificates
        </h3>
      </header>
      <div className="p-5 space-y-3">
        <p className="text-sm text-slate-600">
          Download your donation certificates as a PDF for your records or to share with your
          workplace recognition program.
        </p>
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={() => window.alert("Certificate download coming soon.")}
        >
          <Download className="w-4 h-4" aria-hidden="true" /> Download certificate (PDF)
        </button>
        <p className="text-xs text-slate-400 text-center">Multiple certificates will appear here as you reach donation milestones.</p>
      </div>
    </section>
  );
}
