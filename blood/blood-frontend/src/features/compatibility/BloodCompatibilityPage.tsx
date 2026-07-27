import { Link } from "react-router-dom";
import {
  Droplet,
  Heart,
  ArrowRight,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const BLOOD_TYPES = [
  {
    type: "O-",
    name: "O Negative",
    color: "bg-red-600",
    textColor: "text-white",
    description: "The universal donor. Can donate to all blood types.",
    canDonateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    canReceiveFrom: ["O-"],
    rarity: "Rare (3-5%)",
    compatible: "Universal donor for all blood types",
  },
  {
    type: "O+",
    name: "O Positive",
    color: "bg-red-500",
    textColor: "text-white",
    description: "The most common blood type. Can donate to all positive types.",
    canDonateTo: ["A+", "B+", "AB+", "O+"],
    canReceiveFrom: ["O+", "O-"],
    rarity: "Common (35-40%)",
    compatible: "Can donate to all Rh+ types",
  },
  {
    type: "A-",
    name: "A Negative",
    color: "bg-blue-500",
    textColor: "text-white",
    description: "Can donate to A and AB types, both positive and negative.",
    canDonateTo: ["A+", "A-", "AB+", "AB-"],
    canReceiveFrom: ["A-", "O-"],
    rarity: "Moderate (6-8%)",
    compatible: "Good for A and AB recipients",
  },
  {
    type: "A+",
    name: "A Positive",
    color: "bg-blue-600",
    textColor: "text-white",
    description: "The second most common type. Can donate to A+ and AB+.",
    canDonateTo: ["A+", "AB+"],
    canReceiveFrom: ["A+", "A-", "O+", "O-"],
    rarity: "Common (30-35%)",
    compatible: "Can donate to A+ and AB+",
  },
  {
    type: "B-",
    name: "B Negative",
    color: "bg-purple-500",
    textColor: "text-white",
    description: "Can donate to B and AB types, both positive and negative.",
    canDonateTo: ["B+", "B-", "AB+", "AB-"],
    canReceiveFrom: ["B-", "O-"],
    rarity: "Moderate (1.5-3%)",
    compatible: "Good for B and AB recipients",
  },
  {
    type: "B+",
    name: "B Positive",
    color: "bg-purple-600",
    textColor: "text-white",
    description: "Can donate to B+ and AB+ recipients.",
    canDonateTo: ["B+", "AB+"],
    canReceiveFrom: ["B+", "B-", "O+", "O-"],
    rarity: "Common (8-10%)",
    compatible: "Can donate to B+ and AB+",
  },
  {
    type: "AB-",
    name: "AB Negative",
    color: "bg-teal-500",
    textColor: "text-white",
    description: "The universal plasma donor. Rare but valuable.",
    canDonateTo: ["A-", "B-", "AB-", "O-"],
    canReceiveFrom: ["AB-", "A-", "B-", "O-"],
    rarity: "Very Rare (0.5-1%)",
    compatible: "Universal plasma donor",
  },
  {
    type: "AB+",
    name: "AB Positive",
    color: "bg-teal-600",
    textColor: "text-white",
    description: "The universal plasma donor. Can receive from all types.",
    canDonateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    canReceiveFrom: ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
    rarity: "Moderate (3-5%)",
    compatible: "Universal recipient",
  },
];

const ALL_BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export function BloodCompatibilityPage() {
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
                  {ALL_BLOOD_TYPES.map((type) => (
                    <th
                      key={type}
                      className={`p-4 text-center font-bold border-b-2 border-slate-200 ${
                        type === "O-"
                          ? "bg-red-50 text-red-700"
                          : type === "AB+"
                          ? "bg-teal-50 text-teal-700"
                          : ""
                      }`}
                    >
                      <div className={`w-10 h-10 ${getBloodColor(type)} rounded-full mx-auto flex items-center justify-center text-sm font-bold ${getTextColor(type)}`}>
                        {type}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_BLOOD_TYPES.map((donorType, i) => (
                  <tr key={donorType} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className={`p-4 font-semibold border-b border-slate-200 ${
                      donorType === "O-" ? "bg-red-50 text-red-700" : ""
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${getBloodColor(donorType)} rounded-full flex items-center justify-center text-xs font-bold ${getTextColor(donorType)}`}>
                          {donorType}
                        </div>
                        <span>{getBloodName(donorType)}</span>
                      </div>
                    </td>
                    {ALL_BLOOD_TYPES.map((recipientType) => (
                      <td key={recipientType} className="p-4 text-center border-b border-slate-200">
                        {isCompatible(donorType, recipientType) ? (
                          <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-6 h-6 text-slate-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
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
            Click on a blood type to learn more about its characteristics and compatibility.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BLOOD_TYPES.map((blood) => (
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

function BloodTypeCard({ blood }: { blood: (typeof BLOOD_TYPES)[0] }) {
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
        <p className="text-slate-600 text-sm">{blood.description}</p>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Can Donate To</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {blood.canDonateTo.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Can Receive From</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {blood.canReceiveFrom.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                >
                  {type}
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

// Helper functions
function getBloodColor(type: string): string {
  const colors: Record<string, string> = {
    "O-": "bg-red-600",
    "O+": "bg-red-500",
    "A-": "bg-blue-500",
    "A+": "bg-blue-600",
    "B-": "bg-purple-500",
    "B+": "bg-purple-600",
    "AB-": "bg-teal-500",
    "AB+": "bg-teal-600",
  };
  return colors[type] || "bg-slate-500";
}

function getTextColor(_type: string): string {
  return "text-white";
}

function getBloodName(type: string): string {
  const names: Record<string, string> = {
    "O-": "O Negative",
    "O+": "O Positive",
    "A-": "A Negative",
    "A+": "A Positive",
    "B-": "B Negative",
    "B+": "B Positive",
    "AB-": "AB Negative",
    "AB+": "AB Positive",
  };
  return names[type] || type;
}

function isCompatible(donor: string, recipient: string): boolean {
  // Simplified compatibility check
  const compatibility: Record<string, string[]> = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"],
  };
  return compatibility[donor]?.includes(recipient) || false;
}
