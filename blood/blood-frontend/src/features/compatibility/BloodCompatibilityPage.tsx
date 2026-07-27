import { Link } from "react-router-dom";
import { useAll1 } from "@/shared/api/generated/blood-compatibility-controller/blood-compatibility-controller";
import {
  Droplet,
  Heart,
  ArrowRight,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

interface CompatibilityEntry {
  type: string;
  name: string;
  color: string;
  textColor: string;
  description: string;
  rarity: string;
  compatible: string;
  canDonateTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
  educationNote?: string;
}

const ALL_BLOOD_TYPES = [
  "O_NEGATIVE",
  "O_POSITIVE",
  "A_NEGATIVE",
  "A_POSITIVE",
  "B_NEGATIVE",
  "B_POSITIVE",
  "AB_NEGATIVE",
  "AB_POSITIVE",
];

const BLOOD_METADATA: Record<
  BloodGroup,
  { short: string; name: string; color: string; rarity: string; compatible: string }
> = {
  O_NEGATIVE: {
    short: "O-",
    name: "O Negative",
    color: "bg-red-600",
    rarity: "Rare (3-5%)",
    compatible: "Universal donor for all blood types",
  },
  O_POSITIVE: {
    short: "O+",
    name: "O Positive",
    color: "bg-red-500",
    rarity: "Common (35-40%)",
    compatible: "Can donate to all Rh+ types",
  },
  A_NEGATIVE: {
    short: "A-",
    name: "A Negative",
    color: "bg-blue-500",
    rarity: "Moderate (6-8%)",
    compatible: "Good for A and AB recipients",
  },
  A_POSITIVE: {
    short: "A+",
    name: "A Positive",
    color: "bg-blue-600",
    rarity: "Common (30-35%)",
    compatible: "Can donate to A+ and AB+",
  },
  B_NEGATIVE: {
    short: "B-",
    name: "B Negative",
    color: "bg-purple-500",
    rarity: "Moderate (1.5-3%)",
    compatible: "Good for B and AB recipients",
  },
  B_POSITIVE: {
    short: "B+",
    name: "B Positive",
    color: "bg-purple-600",
    rarity: "Common (8-10%)",
    compatible: "Can donate to B+ and AB+",
  },
  AB_NEGATIVE: {
    short: "AB-",
    name: "AB Negative",
    color: "bg-teal-500",
    rarity: "Very Rare (0.5-1%)",
    compatible: "Universal plasma donor",
  },
  AB_POSITIVE: {
    short: "AB+",
    name: "AB Positive",
    color: "bg-teal-600",
    rarity: "Moderate (3-5%)",
    compatible: "Universal recipient",
  },
};

const COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  O_NEGATIVE: ALL_BLOOD_TYPES as BloodGroup[],
  O_POSITIVE: ["O_POSITIVE", "A_POSITIVE", "B_POSITIVE", "AB_POSITIVE"],
  A_NEGATIVE: ["A_NEGATIVE", "A_POSITIVE", "AB_NEGATIVE", "AB_POSITIVE"],
  A_POSITIVE: ["A_POSITIVE", "AB_POSITIVE"],
  B_NEGATIVE: ["B_NEGATIVE", "B_POSITIVE", "AB_NEGATIVE", "AB_POSITIVE"],
  B_POSITIVE: ["B_POSITIVE", "AB_POSITIVE"],
  AB_NEGATIVE: ["AB_NEGATIVE", "AB_POSITIVE"],
  AB_POSITIVE: ["AB_POSITIVE"],
};

export function BloodCompatibilityPage() {
  const { data: response, isLoading, isError } = useAll1();

  if (isError) {
    toast.error("Failed to load blood compatibility data");
  }

  // Extract data from API response (ApiResponse<List<BloodCompatibilityResponse>>)
  const compatibilityData: CompatibilityEntry[] =
    (((response?.data as any)?.data as Array<any>) || []).map((item) => {
      const bloodGroup = item.bloodGroup as BloodGroup;
      const meta = BLOOD_METADATA[bloodGroup] ?? {
        short: bloodGroup,
        name: bloodGroup,
        color: "bg-slate-500",
        rarity: "",
        compatible: item.educationNote || "",
      };

      return {
        type: meta.short,
        name: meta.name,
        color: meta.color,
        textColor: "text-white",
        description: item.educationNote || "",
        rarity: meta.rarity,
        compatible: meta.compatible,
        canDonateTo: item.canDonateTo as BloodGroup[],
        canReceiveFrom: item.canReceiveFrom as BloodGroup[],
        educationNote: item.educationNote,
      };
    });

  // If API returns no data, fall back to client-side computed mapping
  const displayData: CompatibilityEntry[] =
    compatibilityData.length > 0
      ? compatibilityData
      : (ALL_BLOOD_TYPES as BloodGroup[]).map((bg) => {
          const meta = BLOOD_METADATA[bg];
          return {
            type: meta.short,
            name: meta.name,
            color: meta.color,
            textColor: "text-white",
            description: getDefaultDescription(bg),
            rarity: meta.rarity,
            compatible: meta.compatible,
            canDonateTo: COMPATIBILITY_MATRIX[bg],
            canReceiveFrom: (Object.keys(COMPATIBILITY_MATRIX) as BloodGroup[]).filter(
              (donor) => COMPATIBILITY_MATRIX[donor].includes(bg)
            ),
          };
        });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold">Blood Type Compatibility</h1>
            <p className="mt-4 text-xl text-blue-100">
              Understanding blood types is essential for safe transfusions. Learn about compatibility and find your match.
            </p>
            {isLoading && (
              <p className="mt-2 text-sm text-blue-200 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading live compatibility data from server...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Reference Table */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Blood Type Compatibility Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 text-left font-semibold text-slate-700 border-b-2 border-slate-200">
                    Donor Type
                  </th>
                  {(ALL_BLOOD_TYPES as BloodGroup[]).map((type) => {
                    const meta = BLOOD_METADATA[type];
                    return (
                      <th
                        key={type}
                        className={`p-4 text-center font-bold border-b-2 border-slate-200 ${
                          type === "O_NEGATIVE"
                            ? "bg-red-50 text-red-700"
                            : type === "AB_POSITIVE"
                            ? "bg-teal-50 text-teal-700"
                            : ""
                        }`}
                      >
                        <div className={`w-10 h-10 ${meta.color} rounded-full mx-auto flex items-center justify-center text-sm font-bold text-white`}>
                          {meta.short}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {(ALL_BLOOD_TYPES as BloodGroup[]).map((donorType, i) => {
                  const meta = BLOOD_METADATA[donorType];
                  return (
                    <tr key={donorType} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className={`p-4 font-semibold border-b border-slate-200 ${
                        donorType === "O_NEGATIVE" ? "bg-red-50 text-red-700" : ""
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${meta.color} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                            {meta.short}
                          </div>
                          <span>{meta.name}</span>
                        </div>
                      </td>
                      {(ALL_BLOOD_TYPES as BloodGroup[]).map((recipientType) => (
                        <td key={recipientType} className="p-4 text-center border-b border-slate-200">
                          {isCompatibleLocal(donorType, recipientType) ? (
                            <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-6 h-6 text-slate-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-slate-300" />
              <span>Not Compatible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Type Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">All Blood Types</h2>
          <p className="text-slate-600 mb-8">
            Information sourced from the Blood Connect compatibility registry.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayData.map((blood) => (
              <BloodTypeCard key={blood.type} blood={blood} />
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Understanding Blood Types</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <InfoCard
              icon={<Droplet className="w-6 h-6" />}
              title="What are Blood Types?"
              description="Blood types are determined by the presence or absence of antigens on red blood cells. The two main systems are ABO and Rh."
            />
            <InfoCard
              icon={<Heart className="w-6 h-6" />}
              title="Why Compatibility Matters"
              description="Receiving an incompatible blood type can trigger a dangerous immune response. Matching ensures safe transfusions."
            />
            <InfoCard
              icon={<Users className="w-6 h-6" />}
              title="Rh Factor"
              description="The Rh factor (positive or negative) is another antigen. It affects pregnancy and transfusion compatibility."
            />
          </div>
        </div>
      </section>

      {/* Emergency Info */}
      <section className="py-12 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">In Emergency Situations</h3>
              <p className="text-red-800">
                O- blood is the universal donor and can be given to anyone in life-threatening emergencies.
                However, the patient's blood type is quickly identified and matched blood is used when available.
                <Link to="/emergency" className="font-semibold underline ml-1">
                  Learn about emergency blood requests
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Ready to Donate?</h2>
          <p className="mt-2 text-red-100">
            Check your eligibility and find a donation center near you
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/eligibility"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 rounded-xl font-bold hover:bg-yellow-50 transition-colors"
            >
              Check Eligibility
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/centers"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Find Donation Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function BloodTypeCard({ blood }: { blood: CompatibilityEntry }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`${blood.color} ${blood.textColor} p-6 text-center`}>
        <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold">
          {blood.type}
        </div>
        <h3 className="mt-3 text-xl font-bold">{blood.name}</h3>
        <p className="text-sm opacity-80 mt-1">{blood.rarity}</p>
      </div>
      <div className="p-6">
        <p className="text-slate-600 text-sm">{blood.description || blood.compatible}</p>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Can Donate To</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {blood.canDonateTo.map((bg) => (
                <span
                  key={bg}
                  className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium"
                >
                  {BLOOD_METADATA[bg]?.short ?? bg}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Can Receive From</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {blood.canReceiveFrom.map((bg) => (
                <span
                  key={bg}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                >
                  {BLOOD_METADATA[bg]?.short ?? bg}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function isCompatibleLocal(donor: BloodGroup, recipient: BloodGroup): boolean {
  return COMPATIBILITY_MATRIX[donor]?.includes(recipient) ?? false;
}

function getDefaultDescription(bg: BloodGroup): string {
  const descriptions: Record<BloodGroup, string> = {
    O_NEGATIVE: "The universal donor. Can donate to all blood types.",
    O_POSITIVE: "The most common blood type. Can donate to all positive types.",
    A_NEGATIVE: "Can donate to A and AB types, both positive and negative.",
    A_POSITIVE: "The second most common type. Can donate to A+ and AB+.",
    B_NEGATIVE: "Can donate to B and AB types, both positive and negative.",
    B_POSITIVE: "Can donate to B+ and AB+ recipients.",
    AB_NEGATIVE: "The rarest blood type. Universal plasma donor.",
    AB_POSITIVE: "Can receive from all blood types.",
  };
  return descriptions[bg];
}
