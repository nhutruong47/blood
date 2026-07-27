import { Outlet, Link } from "react-router-dom";
import { Droplet, Heart, ShieldCheck } from "lucide-react";

/**
 * AuthLayout
 * Used for login, register, forgot-password, and other public authentication
 * pages. Renders a brand-focused, full-height gradient backdrop with a centered
 * white card so users land in a calm, focused context rather than inside the
 * application shell.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex flex-col relative overflow-hidden">
      <BackgroundDecor />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2 text-white" aria-label="Blood Connect home">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Droplet className="w-5 h-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">Blood Connect</span>
        </Link>
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white font-medium transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-md">
                <Droplet className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900 text-center">
                Blood Connect
              </h1>
              <p className="mt-1 text-sm text-slate-500 text-center">
                Empowering communities through life-saving donations
              </p>
            </div>
            <Outlet />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-white/90">
            <TrustBadge icon={<ShieldCheck className="w-4 h-4" />} label="HIPAA-grade security" />
            <TrustBadge icon={<Heart className="w-4 h-4" />} label="Trusted by 50k+ donors" />
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center text-xs text-white/70 py-4 px-6">
        &copy; {new Date().getFullYear()} Blood Connect Platform. All rights reserved.
      </footer>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs bg-white/10 border border-white/15 rounded-full px-3 py-1.5 backdrop-blur-sm">
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-500/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-rose-500/30 blur-3xl"
      />
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>
    </>
  );
}
