import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { AXIOS_INSTANCE } from "@/shared/api/axios-instance";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

type RequestState = "idle" | "submitting" | "sent" | "error";

export function ForgotPasswordPage() {
  const [state, setState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setState("submitting");
    setErrorMessage(null);
    try {
      await AXIOS_INSTANCE.post("/api/forgot-password", { email: data.email });
      setState("sent");
      toast.success("If that email exists, a reset link has been sent.");
    } catch (err: unknown) {
      const message = extractErrorMessage(err) || "We couldn't send the reset link right now.";
      setErrorMessage(message);
      setState("error");
      toast.error(message);
    }
  };

  return (
    <div className="space-y-5">
      {state === "sent" ? (
        <SentState email={getValues("email")} onResend={() => setState("idle")} />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Forgot your password?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the email associated with your account and we&apos;ll send you a link to
              reset your password.
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
            {errorMessage && state === "error" && !errors.email && (
              <p className="text-sm text-red-600" role="alert">
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
                Sending reset link...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                Send Reset Link
              </>
            )}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to sign in
          </Link>
        </form>
      )}
    </div>
  );
}

function SentState({ email, onResend }: { email: string; onResend: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
        <p className="mt-1 text-sm text-slate-600">
          We sent a password reset link to{" "}
          <span className="font-medium text-slate-800">{email || "your inbox"}</span>. The
          link expires in 30 minutes.
        </p>
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={onResend}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Didn&apos;t receive it? Try a different email
        </button>
        <p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to sign in
          </Link>
        </p>
      </div>
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
