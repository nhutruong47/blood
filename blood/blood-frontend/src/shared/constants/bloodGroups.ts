/**
 * Centralized blood-group label maps shared across the app.
 * The backend uses enum values like A_POSITIVE, O_NEGATIVE; we render them in
 * compact short form ("A+", "O-") for UI badges and chips, and a long form
 * ("A Positive") for full display contexts.
 */

export const BLOOD_GROUP_OPTIONS: ReadonlyArray<{
  value:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE';
  label: string;
}> = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
];

export const BLOOD_GROUP_SHORT: Record<string, string> = BLOOD_GROUP_OPTIONS.reduce(
  (acc, { value, label }) => {
    acc[value] = label;
    return acc;
  },
  {} as Record<string, string>,
);

export const BLOOD_GROUP_LONG: Record<string, string> = {
  A_POSITIVE: 'A Positive',
  A_NEGATIVE: 'A Negative',
  B_POSITIVE: 'B Positive',
  B_NEGATIVE: 'B Negative',
  AB_POSITIVE: 'AB Positive',
  AB_NEGATIVE: 'AB Negative',
  O_POSITIVE: 'O Positive',
  O_NEGATIVE: 'O Negative',
};

export function formatBloodGroup(value: string | undefined | null, style: 'short' | 'long' = 'short'): string {
  if (!value) return 'Unknown';
  if (style === 'long') return BLOOD_GROUP_LONG[value] ?? value.replace(/_/g, ' ');
  return BLOOD_GROUP_SHORT[value] ?? value.replace(/_/g, ' ');
}
