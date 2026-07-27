import { Link } from "react-router-dom";
import {
  Droplet,
  MapPin,
  Heart,
  AlertCircle,
  Shield,
  Users,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  ArrowRight,
  Star,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Droplet className="w-8 h-8 text-red-600" />
              <span className="font-bold text-xl text-slate-900">Blood Connect</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/centers" className="text-slate-600 hover:text-red-600 transition-colors font-medium">
                Find Centers
              </Link>
              <Link to="/eligibility" className="text-slate-600 hover:text-red-600 transition-colors font-medium">
                Check Eligibility
              </Link>
              <Link to="/blood-compatibility" className="text-slate-600 hover:text-red-600 transition-colors font-medium">
                Blood Types
              </Link>
              <Link
                to="/emergency"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <AlertCircle className="w-4 h-4" />
                Emergency
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDRzMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Your Blood Can <span className="text-yellow-300">Save Lives</span>
              </h1>
              <p className="mt-6 text-xl text-red-100 leading-relaxed">
                Join millions of donors in Vietnam. Find a donation center near you, check your eligibility, and schedule your life-saving appointment today.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/centers"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 rounded-xl font-bold text-lg hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MapPin className="w-5 h-5" />
                  Find Donation Center
                </Link>
                <Link
                  to="/eligibility"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-400 transition-all border-2 border-white/30"
                >
                  <Heart className="w-5 h-5" />
                  Check Eligibility
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Free & Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Quick 30 min process</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Safe & Sterile</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/20 rounded-2xl p-6 text-center">
                    <div className="text-5xl font-bold text-yellow-300">500K+</div>
                    <div className="text-red-100 mt-2">Donations This Year</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6 text-center">
                    <div className="text-5xl font-bold text-yellow-300">50+</div>
                    <div className="text-red-100 mt-2">Centers Nationwide</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6 text-center">
                    <div className="text-5xl font-bold text-yellow-300">98%</div>
                    <div className="text-red-100 mt-2">Satisfaction Rate</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6 text-center">
                    <div className="text-5xl font-bold text-yellow-300">24/7</div>
                    <div className="text-red-100 mt-2">Emergency Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">What Would You Like To Do?</h2>
            <p className="mt-4 text-lg text-slate-600">Choose from our quick actions to get started</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ActionCard
              icon={<MapPin className="w-8 h-8" />}
              title="Find Centers"
              description="Locate donation centers near you with real-time availability"
              to="/centers"
              color="red"
            />
            <ActionCard
              icon={<Heart className="w-8 h-8" />}
              title="Check Eligibility"
              description="Take our quick 2-minute health questionnaire"
              to="/eligibility"
              color="pink"
            />
            <ActionCard
              icon={<AlertCircle className="w-8 h-8" />}
              title="Emergency Request"
              description="Submit urgent blood needs for hospitals"
              to="/emergency"
              color="orange"
            />
            <ActionCard
              icon={<Users className="w-8 h-8" />}
              title="Blood Compatibility"
              description="Learn about blood types and compatibility"
              to="/blood-compatibility"
              color="blue"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">Your four simple steps to save a life</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number={1}
              title="Check Eligibility"
              description="Answer a few quick health questions to see if you can donate"
            />
            <StepCard
              number={2}
              title="Find a Center"
              description="Search for nearby donation centers with available appointments"
            />
            <StepCard
              number={3}
              title="Schedule Visit"
              description="Book your appointment at a time that works for you"
            />
            <StepCard
              number={4}
              title="Save Lives"
              description="Arrive, donate in 30 minutes, and make a difference"
            />
          </div>
        </div>
      </section>

      {/* Blood Types Info */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Blood Type Compatibility</h2>
            <p className="mt-4 text-slate-300">Know your type, save more lives</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { type: "O-", desc: "Universal Donor", color: "bg-red-500" },
              { type: "O+", desc: "Most Common", color: "bg-red-400" },
              { type: "A+", desc: "35% Population", color: "bg-blue-400" },
              { type: "B+", desc: "8.5% Population", color: "bg-purple-400" },
            ].map((blood) => (
              <div key={blood.type} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/20 transition-colors">
                <div className={`w-16 h-16 ${blood.color} rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white mb-4`}>
                  {blood.type}
                </div>
                <div className="font-semibold">{blood.desc}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/blood-compatibility" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold">
              Learn more about blood types
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">100% Safe</h3>
              <p className="text-slate-600">Sterile equipment and trained medical professionals ensure your safety</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Quick Process</h3>
              <p className="text-slate-600">The entire donation process takes only 30-45 minutes</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Get Rewarded</h3>
              <p className="text-slate-600">Earn certificates and track your life-saving impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Save Lives?</h2>
          <p className="mt-4 text-xl text-red-100">Join our community of heroes and make a difference today</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/centers" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 rounded-xl font-bold hover:bg-yellow-50 transition-colors">
              Find a Center Near You
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplet className="w-6 h-6 text-red-500" />
                <span className="font-bold text-lg">Blood Connect</span>
              </div>
              <p className="text-slate-400">Connecting donors with those in need, one drop at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/centers" className="hover:text-white transition-colors">Find Centers</Link></li>
                <li><Link to="/eligibility" className="hover:text-white transition-colors">Eligibility Check</Link></li>
                <li><Link to="/emergency" className="hover:text-white transition-colors">Emergency Request</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  1900-XXXX
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@bloodconnect.vn
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2026 Blood Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  to,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
    pink: "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100",
    orange: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
  };

  return (
    <Link
      to={to}
      className={`block p-6 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${colorClasses[color]}`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </Link>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <div className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
      {number < 4 && (
        <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-slate-200 -z10" />
      )}
    </div>
  );
}
