import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, LogIn, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type User } from "@/contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function dashboardPathForRole(role: User["role"] | string): string {
  const upper = String(role || "").toUpperCase();
  if (upper === "DONOR") return "/donor/dashboard";
  if (upper === "HOSPITAL") return "/hospital/dashboard";
  if (upper === "MEDICALCENTER" || upper === "STAFF" || upper === "LAB_STAFF" || upper === "MEDICAL_STAFF") {
    return "/medicalcenter/dashboard";
  }
  if (upper === "ADMIN" || upper === "SUPER_ADMIN") return "/admin/dashboard";
  return "/dashboard";
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      const redirectTarget =
        (location.state as { from?: string } | null)?.from ||
        dashboardPathForRole(user?.role || "");
      toast.success("Welcome back! Signing you in...");
      navigate(redirectTarget, { replace: true });
    } catch (err: unknown) {
      const message =
        extractErrorMessage(err) || "Login failed. Please check your credentials.";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and password to access your dashboard.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
            className="w-full pl-4 pr-11 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 select-none cursor-pointer">
        <input
          type="checkbox"
          {...register("remember")}
          className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        />
        <span className="text-sm text-slate-600">Keep me signed in</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" aria-hidden="true" />
            Sign In
          </>
        )}
      </button>

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-red-600 hover:text-red-700">
          Register
        </Link>
      </p>
    </form>
  );
}

function extractErrorMessage(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null) {
    const ax = err as { response?: { data?: { message?: string } } };
    return ax.response?.data?.message;
  }
  return undefined;
}
