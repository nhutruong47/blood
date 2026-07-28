import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bell,
  Building2,
  Check,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMe } from "@/shared/api/generated/auth-controller/auth-controller";

type TabKey = "profile" | "notifications" | "security";

const TAB_DEFS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
];

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
  emergencyAlerts: boolean;
  donationReminders: boolean;
  newsletter: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  email: true,
  sms: true,
  push: true,
  emergencyAlerts: true,
  donationReminders: true,
  newsletter: false,
};

const NOTIFICATION_STORAGE_KEY = "bc.notification-prefs";

function loadStoredPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information, notification preferences, and security.
        </p>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50">
          <nav className="flex overflow-x-auto" role="tablist" aria-label="Settings sections">
            {TAB_DEFS.map(({ key, label, icon: Icon }) => {
              const active = key === activeTab;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`tab-panel-${key}`}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 ${
                    active
                      ? "border-red-600 text-red-700"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-red-600" : "text-slate-400"}`} aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === "profile" && (
            <div id="tab-panel-profile" role="tabpanel">
              <ProfileTab />
            </div>
          )}
          {activeTab === "notifications" && (
            <div id="tab-panel-notifications" role="tabpanel">
              <NotificationsTab />
            </div>
          )}
          {activeTab === "security" && (
            <div id="tab-panel-security" role="tabpanel">
              <SecurityTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const meQuery = useMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    const remote = (meQuery.data?.data as any)?.data;
    if (remote) {
      reset({
        firstName: remote.firstName ?? user?.firstName ?? "",
        lastName: remote.lastName ?? user?.lastName ?? "",
        phone: remote.phone ?? remote.phoneNumber ?? "",
        address: remote.address ?? "",
      });
    }
  }, [meQuery.data, reset, user?.firstName, user?.lastName]);

  const onSubmit = async (data: ProfileFormValues) => {
    // Backend profile-update endpoint (e.g. PATCH /api/users/me) is not yet
    // exposed. Until then we keep the form valid locally and warn the user.
    await new Promise((resolve) => setTimeout(resolve, 200));
    toast.warning("Profile update endpoint pending", {
      description:
        "Your changes are validated but not yet persisted to the server. This will activate once the /api/users/me PATCH endpoint is added.",
    });
    reset(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldRow id="firstName" label="First name" error={errors.firstName?.message} icon={<UserIcon className="w-4 h-4 text-slate-400" />}>
          <input id="firstName" {...register("firstName")} className={`${inputClass} pl-10`} />
        </FieldRow>

        <FieldRow id="lastName" label="Last name" error={errors.lastName?.message} icon={<UserIcon className="w-4 h-4 text-slate-400" />}>
          <input id="lastName" {...register("lastName")} className={`${inputClass} pl-10`} />
        </FieldRow>

        <FieldRow id="email" label="Email" icon={<Mail className="w-4 h-4 text-slate-400" />}>
          <input id="email" value={user?.email ?? ""} readOnly className={`${inputClass} pl-10 bg-slate-50 cursor-not-allowed`} />
        </FieldRow>

        <FieldRow id="phone" label="Phone" error={errors.phone?.message} icon={<Phone className="w-4 h-4 text-slate-400" />}>
          <input id="phone" type="tel" {...register("phone")} className={`${inputClass} pl-10`} />
        </FieldRow>

        <FieldRow id="address" label="Address" error={errors.address?.message} icon={<Building2 className="w-4 h-4 text-slate-400" />}>
          <textarea id="address" rows={2} {...register("address")} className={`${inputClass} pl-10 resize-none`} />
        </FieldRow>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" /> Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [savedPrefs, setSavedPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredPrefs();
    setPrefs(stored);
    setSavedPrefs(stored);
    setHydrated(true);
  }, []);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  const handleToggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(prefs));
      setSavedPrefs(prefs);
      toast.success("Notification preferences updated");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <NotificationGroup title="Delivery channels">
        <ToggleRow
          title="Email notifications"
          description="Receive donation certificates and appointment confirmations by email."
          checked={prefs.email}
          onChange={() => handleToggle("email")}
        />
        <ToggleRow
          title="SMS notifications"
          description="Get time-sensitive booking confirmations via text message."
          checked={prefs.sms}
          onChange={() => handleToggle("sms")}
        />
        <ToggleRow
          title="Push notifications"
          description="Receive updates in your browser when new activity occurs."
          checked={prefs.push}
          onChange={() => handleToggle("push")}
        />
      </NotificationGroup>

      <NotificationGroup title="What we notify you about">
        <ToggleRow
          title="Emergency alerts"
          description="Get an SMS or push when your blood type is urgently needed."
          checked={prefs.emergencyAlerts}
          onChange={() => handleToggle("emergencyAlerts")}
        />
        <ToggleRow
          title="Donation reminders"
          description="Reminders when you become eligible to donate again."
          checked={prefs.donationReminders}
          onChange={() => handleToggle("donationReminders")}
        />
        <ToggleRow
          title="Newsletter"
          description="Monthly updates about the platform and community impact."
          checked={prefs.newsletter}
          onChange={() => handleToggle("newsletter")}
        />
      </NotificationGroup>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setPrefs(savedPrefs)}
          disabled={!dirty || isSaving}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!dirty || isSaving || !hydrated}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" aria-hidden="true" /> Save preferences
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function NotificationGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white">
      <div className="pr-4">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
          checked ? "bg-red-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function SecurityTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async () => {
    // Change-password endpoint (POST /api/users/me/change-password) is not
    // yet exposed. Until then we validate locally and warn the user.
    await new Promise((resolve) => setTimeout(resolve, 200));
    toast.warning("Password update endpoint pending", {
      description:
        "Your new password meets the requirements but cannot be persisted yet. This will activate once the change-password endpoint is added.",
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl" noValidate>
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        Choose a strong password you don&apos;t use anywhere else. We&apos;ll sign you out of
        other devices after a successful change.
      </div>

      <FieldRow id="currentPassword" label="Current password" error={errors.currentPassword?.message} icon={<Lock className="w-4 h-4 text-slate-400" />}>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
          className={`${inputClass} pl-10`}
        />
      </FieldRow>

      <FieldRow id="newPassword" label="New password" error={errors.newPassword?.message} icon={<Lock className="w-4 h-4 text-slate-400" />}>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
          className={`${inputClass} pl-10`}
        />
      </FieldRow>

      <FieldRow id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message} icon={<Lock className="w-4 h-4 text-slate-400" />}>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className={`${inputClass} pl-10`}
        />
      </FieldRow>

      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Updating...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" aria-hidden="true" /> Update password
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors";

function FieldRow({
  id,
  label,
  error,
  icon,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-3.5 inline-flex">{icon}</span>
        )}
        {children}
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
