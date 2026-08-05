import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Users,
  Shield,
  Calendar,
  Star,
  ArrowRight,
  Quote,
  Award,
  Globe,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { getCampaigns, type CampaignResponse } from "@/shared/api/admin-api";

const BENEFITS = [
  {
    icon: Heart,
    title: "Save Lives",
    description: "A single donation can save up to three lives. Your contribution matters more than you know.",
  },
  {
    icon: Shield,
    title: "Health Benefits",
    description: "Regular donation helps maintain healthy iron levels and provides free health screenings.",
  },
  {
    icon: Users,
    title: "Community Impact",
    description: "Join thousands of donors building a stronger, healthier community for everyone.",
  },
];

const STATS = [
  { value: 500000, suffix: "+", label: "Donations collected" },
  { value: 250000, suffix: "+", label: "Lives saved" },
  { value: 50, suffix: "+", label: "Partner centers" },
  { value: 98, suffix: "%", label: "Donor satisfaction" },
];

const TESTIMONIALS = [
  {
    name: "Nguyen Van A",
    role: "Regular donor, 24 donations",
    quote: "Every time I donate, I know I'm making a difference. The staff makes it easy and comfortable.",
    rating: 5,
  },
  {
    name: "Tran Thi B",
    role: "First-time donor",
    quote: "I was nervous at first, but the team walked me through everything. It was over before I knew it!",
    rating: 5,
  },
  {
    name: "Le Hoang C",
    role: "Recipient family member",
    quote: "When my father needed blood, donors we'd never met saved his life. I'll never forget that gift.",
    rating: 5,
  },
];

const PARTNERS = [
  "Red Cross",
  "WHO",
  "Ministry of Health",
  "HCMC Medical University",
  "Vinmec",
  "FV Hospital",
];

export function CampaignPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCampaigns()
      .then((data) => {
        if (!cancelled) setCampaigns(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-red-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="max-w-3xl mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" aria-hidden="true" />
              National Blood Donation Campaign 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Be a Hero.<br />
              <span className="text-yellow-300">Donate Today.</span>
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-2xl">
              Join the largest blood donation campaign of the year. Every drop counts. Together we can ensure no patient goes without the blood they need.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/centers"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 rounded-xl font-bold text-lg hover:bg-yellow-50 transition-all shadow-lg"
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                Donate Now
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/eligibility"
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-500/30 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-red-500/40 transition-all border-2 border-white/30"
              >
                Check Eligibility
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Active Campaigns</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
              Join one of our ongoing campaigns and become part of something bigger.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 py-12">
                No active campaigns at the moment.
              </div>
            ) : (
              campaigns.map((c, i) => (
                <CampaignCard key={c.id} campaign={c} index={i} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Why Donate */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Why Donate Blood?</h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
              Blood donation is one of the most impactful ways to give back to your community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title} className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <b.icon className="w-8 h-8 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-slate-600">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Our Impact</h2>
            <p className="mt-3 text-lg text-slate-300">Together, we're making a measurable difference.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <StatCounter key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Stories From Our Community</h2>
            <p className="mt-3 text-lg text-slate-600">Real donors and recipients share their experiences.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6">
                <Quote className="w-8 h-8 text-red-200 mb-3" aria-hidden="true" />
                <blockquote className="text-slate-700 leading-relaxed mb-4">"{t.quote}"</blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5" aria-label={`Rated ${t.rating} out of 5`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Trusted Partners</h2>
            <p className="mt-2 text-slate-600">Working together to ensure safe, accessible blood supply nationwide.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {PARTNERS.map((p) => (
              <div
                key={p}
                className="flex items-center justify-center h-20 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-semibold text-center px-3"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-80" aria-hidden="true" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Become a Hero?</h2>
          <p className="text-xl text-red-100 mb-8">
            Register today and start saving lives in as little as 30 minutes per donation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 rounded-xl font-bold hover:bg-yellow-50 transition-colors"
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              Register as Donor
            </Link>
            <Link
              to="/centers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-red-500/30 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-red-500/40 transition-colors border-2 border-white/30"
            >
              <Globe className="w-5 h-5" aria-hidden="true" />
              Find a Center
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule CTA */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-700 mb-2">
            <Calendar className="w-5 h-5 text-red-600" aria-hidden="true" />
            <span className="font-semibold">Plan ahead</span>
          </div>
          <p className="text-slate-600 mb-6">Browse available slots and book your donation at a time that works for you.</p>
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            View Schedule
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function CampaignCard({ campaign, index }: { campaign: CampaignResponse; index: number }) {
  const colors = [
    "from-red-500 to-orange-500",
    "from-blue-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-purple-500 to-pink-500",
    "from-amber-500 to-yellow-500",
  ];
  const color = colors[index % colors.length];

  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
      <div className={`h-40 bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
        <Heart className="w-16 h-16 text-white opacity-80" aria-hidden="true" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{campaign.title}</h3>
        <p className="text-slate-600 mb-4 line-clamp-3">{campaign.description}</p>
        <div className="mt-auto">
          <Link
            to="/centers"
            className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700"
          >
            Join campaign
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

interface StatCounterProps {
  value: number;
  suffix: string;
  label: string;
}

function StatCounter({ value, suffix, label }: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const duration = 1500;
            const steps = 30;
            const stepValue = value / steps;
            let current = 0;
            const interval = duration / steps;
            const id = setInterval(() => {
              current += stepValue;
              if (current >= value) {
                setDisplayValue(value);
                clearInterval(id);
              } else {
                setDisplayValue(Math.floor(current));
              }
            }, interval);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-bold text-yellow-300">
        {displayValue.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-slate-300">{label}</p>
    </div>
  );
}