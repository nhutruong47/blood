import { cn } from "@/shared/utils/utils";

export type UrgencyKey = "ROUTINE" | "URGENT" | "EMERGENCY";

const URGENCY_STYLES: Record<string, { bg: string; label: string; dot: string }> = {
  ROUTINE: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Routine",
    dot: "bg-slate-400",
  },
  URGENT: {
    bg: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Urgent",
    dot: "bg-amber-500",
  },
  EMERGENCY: {
    bg: "bg-red-100 text-red-700 border-red-200",
    label: "Emergency",
    dot: "bg-red-500",
  },
};

interface UrgencyBadgeProps {
  urgency?: string | null;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const key = urgency ?? "ROUTINE";
  const style = URGENCY_STYLES[key] ?? URGENCY_STYLES.ROUTINE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border",
        style.bg,
        className
      )}
      aria-label={`Urgency: ${style.label}`}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  );
}