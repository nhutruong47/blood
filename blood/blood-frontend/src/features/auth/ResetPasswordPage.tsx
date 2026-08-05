import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AXIOS_INSTANCE } from "@/shared/api/axios-instance";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type RequestState = "idle" | "submitting" | "success" | "error";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [state, setState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error("Invalid or missing password reset token.");
      return;
    }

    setState("submitting");
    setErrorMessage(null);
    try {
      await AXIOS_INSTANCE.post("/api/reset-password", {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setState("success");
      toast.success("Password reset successfully. You can now log in.");
    } catch (err: unknown) {
      const message = extractErrorMessage(err) || "Failed to reset password. The link might be expired.";
      setErrorMessage(message);
      setState("error");
      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Invalid Link</h2>
        <p className="mt-1 text-sm text-slate-500">
          The password reset link is invalid or missing the token. Please request a new link.
        </p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 mt-4 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Password Reset Complete</h2>
          <p className="mt-1 text-sm text-slate-600">
            Your password has been successfully reset. You can now use your new password to log in.
          </p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Set new password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Please enter your new password below. Ensure it is strong and secure.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
              New Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.newPassword ? "true" : "false"}
                {...register("newPassword")}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              />
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600" role="alert">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                {...register("confirmPassword")}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {errorMessage && state === "error" && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100" role="alert">
              {errorMessage}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to sign in
        </Link>
      </form>
    </div>
  );
}

function extractErrorMessage(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null) {
    const ax = err as { response?: { data?: { message?: string } } };
    return ax.response?.data?.message;
  }
  return undefined;
}
