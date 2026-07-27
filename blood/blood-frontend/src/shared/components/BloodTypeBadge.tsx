import { cn } from "@/shared/utils/utils";

export type BloodGroupKey =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

export const BLOOD_GROUP_SHORT: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

const BLOOD_GROUP_COLOR: Record<string, string> = {
  O_POSITIVE: "bg-red-100 text-red-700 border-red-200",
  O_NEGATIVE: "bg-red-200 text-red-800 border-red-300",
  A_POSITIVE: "bg-blue-100 text-blue-700 border-blue-200",
  A_NEGATIVE: "bg-blue-200 text-blue-800 border-blue-300",
  B_POSITIVE: "bg-purple-100 text-purple-700 border-purple-200",
  B_NEGATIVE: "bg-purple-200 text-purple-800 border-purple-300",
  AB_POSITIVE: "bg-teal-100 text-teal-700 border-teal-200",
  AB_NEGATIVE: "bg-teal-200 text-teal-800 border-teal-300",
};

interface BloodTypeBadgeProps {
  bloodGroup?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BloodTypeBadge({
  bloodGroup,
  className,
  size = "md",
}: BloodTypeBadgeProps) {
  const short = (bloodGroup && BLOOD_GROUP_SHORT[bloodGroup]) || bloodGroup || "—";
  const colors = (bloodGroup && BLOOD_GROUP_COLOR[bloodGroup]) ||
    "bg-slate-100 text-slate-700 border-slate-200";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-full border",
        sizeClasses[size],
        colors,
        className
      )}
      aria-label={`Blood type ${short}`}
    >
      {short}
    </span>
  );
}