import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRegister } from "@/shared/api/generated/auth-controller/auth-controller";
import { BLOOD_GROUP_OPTIONS } from "@/shared/constants/bloodGroups";

const VIETNAM_PHONE_REGEX = /^(?:\+84|0)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/;

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z
      .string()
      .optional()
      .refine(
        (value) => !value || VIETNAM_PHONE_REGEX.test(value.trim()),
        "Use a valid Vietnamese phone number (e.g. 0912345678)",
      ),
    bloodGroup: z.enum([
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
    ]),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((value) => {
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) return false;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
        return age >= 18 && age <= 65;
      }, "Donors must be between 18 and 65 years old"),
    address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

function evaluatePasswordStrength(password: string): { score: PasswordStrength; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 12) score = Math.min(4, score + 1);
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const safeScore = Math.max(0, Math.min(4, score)) as PasswordStrength;
  return { score: safeScore, label: labels[safeScore] };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bloodGroup: "O_POSITIVE",
      dateOfBirth: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") ?? "";
  const strength = useMemo(() => evaluatePasswordStrength(passwordValue), [passwordValue]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    const payload = {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      bloodGroup: data.bloodGroup,
    };
    try {
      await registerMutation.mutateAsync({ data: payload });
      toast.success("Account created", {
        description: "You can now sign in with your new credentials.",
      });
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const message = extractErrorMessage(err) || "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  const submitting = isSubmitting || registerMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Join our community of life-savers. It only takes a minute.
        </p>
      </div>

      <Section title="Personal information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="firstName" label="First name" error={errors.firstName?.message}>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Jane"
              aria-invalid={errors.firstName ? "true" : "false"}
              {...register("firstName")}
              className={inputClass}
            />
          </Field>

          <Field id="lastName" label="Last name" error={errors.lastName?.message}>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
              aria-invalid={errors.lastName ? "true" : "false"}
              {...register("lastName")}
              className={inputClass}
            />
          </Field>

          <Field id="email" label="Email address" error={errors.email?.message}>
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
                {...register("email")}
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>

          <Field id="phone" label="Phone (optional)" error={errors.phone?.message}>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0912345678"
                aria-invalid={errors.phone ? "true" : "false"}
                {...register("phone")}
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>

          <Field id="bloodGroup" label="Blood type" error={errors.bloodGroup?.message}>
            <select
              id="bloodGroup"
              aria-invalid={errors.bloodGroup ? "true" : "false"}
              {...register("bloodGroup")}
              className={`${inputClass} appearance-none bg-white`}
            >
              {BLOOD_GROUP_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth?.message}>
            <div className="relative">
              <CalendarDays
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="dateOfBirth"
                type="date"
                aria-invalid={errors.dateOfBirth ? "true" : "false"}
                {...register("dateOfBirth")}
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>
        </div>

        <Field id="address" label="Address" error={errors.address?.message}>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <textarea
              id="address"
              rows={2}
              placeholder="123 Main St, District 1, Ho Chi Minh City"
              aria-invalid={errors.address ? "true" : "false"}
              {...register("address")}
              className={`${inputClass} pl-10 resize-none`}
            />
          </div>
        </Field>
      </Section>

      <Section title="Security">
        <Field
          id="password"
          label="Password"
          error={errors.password?.message}
          helper={
            <PasswordStrength score={strength.score} label={strength.label} />
          }
        >
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
              className={`${inputClass} pl-10 pr-11`}
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
        </Field>

        <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              {...register("confirmPassword")}
              className={`${inputClass} pl-10 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        <PasswordChecklist password={passwordValue} confirm={watch("confirmPassword") ?? ""} />
      </Section>

      <label className="flex items-start gap-2 select-none cursor-pointer">
        <input
          type="checkbox"
          {...register("acceptTerms")}
          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        />
        <span className="text-sm text-slate-600">
          I agree to the{" "}
          <a href="#" className="font-medium text-red-600 hover:text-red-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-red-600 hover:text-red-700">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600 -mt-3" role="alert">
          {errors.acceptTerms.message}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Create Account
          </>
        )}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-red-600 hover:text-red-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}

const inputClass =
  "w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-slate-700 mb-1">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  error,
  helper,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  helper?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : helper ? (
        <div className="mt-1">{helper}</div>
      ) : null}
    </div>
  );
}

function PasswordStrength({ score, label }: { score: PasswordStrength; label: string }) {
  const segments = [0, 1, 2, 3];
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex-1 flex gap-1">
        {segments.map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              segment < score ? strengthColor(score) : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-500 w-16 text-right">{label}</span>
    </div>
  );
}

function strengthColor(score: PasswordStrength): string {
  if (score <= 1) return "bg-red-500";
  if (score === 2) return "bg-orange-500";
  if (score === 3) return "bg-yellow-500";
  return "bg-green-500";
}

function PasswordChecklist({ password, confirm }: { password: string; confirm: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One lowercase letter", pass: /[a-z]/.test(password) },
    { label: "One number", pass: /\d/.test(password) },
    { label: "Passwords match", pass: !!password && password === confirm },
  ];
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-500">
      {checks.map(({ label, pass }) => (
        <li key={label} className="flex items-center gap-1.5">
          {pass ? (
            <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          )}
          <span className={pass ? "text-green-700" : ""}>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function extractErrorMessage(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null) {
    const ax = err as { response?: { data?: { message?: string } } };
    return ax.response?.data?.message;
  }
  return undefined;
}
