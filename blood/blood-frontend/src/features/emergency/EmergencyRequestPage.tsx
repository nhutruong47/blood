import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Phone,
  Building,
  Send,
  CheckCircle,
  Droplet,
  User,
  Clock,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreate1 } from "@/shared/api/generated/emergency-request-controller/emergency-request-controller";
import type { CreateEmergencyRequestBloodGroup } from "@/shared/api/generated/model/createEmergencyRequestBloodGroup";
import type { CreateEmergencyRequestComponentType } from "@/shared/api/generated/model/createEmergencyRequestComponentType";

const BLOOD_TYPES: Array<{ short: string; api: CreateEmergencyRequestBloodGroup }> = [
  { short: "O-", api: "O_NEGATIVE" },
  { short: "O+", api: "O_POSITIVE" },
  { short: "A-", api: "A_NEGATIVE" },
  { short: "A+", api: "A_POSITIVE" },
  { short: "B-", api: "B_NEGATIVE" },
  { short: "B+", api: "B_POSITIVE" },
  { short: "AB-", api: "AB_NEGATIVE" },
  { short: "AB+", api: "AB_POSITIVE" },
];

const URGENCY_LEVELS = [
  { value: "LOW", label: "Low", description: "Within 48 hours", color: "bg-green-100 text-green-800" },
  { value: "MEDIUM", label: "Medium", description: "Within 24 hours", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "High", description: "Within 6 hours", color: "bg-orange-100 text-orange-800" },
  { value: "CRITICAL", label: "Critical", description: "Immediate", color: "bg-red-100 text-red-800" },
];

const COMPONENTS: Array<{ value: CreateEmergencyRequestComponentType; label: string }> = [
  { value: "WHOLE_BLOOD", label: "Whole Blood" },
  { value: "RBC", label: "Red Blood Cells" },
  { value: "PLASMA", label: "Plasma" },
  { value: "PLATELET", label: "Platelet" },
];

export function EmergencyRequestPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [requestType, setRequestType] = useState<"hospital" | "public">("hospital");
  const [formData, setFormData] = useState({
    requesterName: "",
    requesterPhone: "",
    requesterEmail: "",
    hospitalName: "",
    hospitalAddress: "",
    patientInfo: "",
    bloodTypeShort: "",
    component: "WHOLE_BLOOD" as CreateEmergencyRequestComponentType,
    unitsRequired: 1,
    urgency: "MEDIUM",
    requiredDate: "",
    notes: "",
  });

  const createEmergencyMutation = useCreate1();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bloodTypeShort) {
      toast.error("Please select a blood type");
      return;
    }

    const bloodTypeEntry = BLOOD_TYPES.find((b) => b.short === formData.bloodTypeShort);
    if (!bloodTypeEntry) {
      toast.error("Invalid blood type selected");
      return;
    }

    // Combine hospital info + patient info into recipientInfo
    const recipientInfo = [
      formData.hospitalName && `Hospital: ${formData.hospitalName}`,
      formData.hospitalAddress && `Address: ${formData.hospitalAddress}`,
      formData.patientInfo && `Patient: ${formData.patientInfo}`,
      `Contact: ${formData.requesterName} (${formData.requesterPhone})`,
      `Urgency: ${formData.urgency}`,
      formData.requiredDate && `Required by: ${formData.requiredDate}`,
      formData.notes && `Notes: ${formData.notes}`,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      await createEmergencyMutation.mutateAsync({
        data: {
          bloodGroup: bloodTypeEntry.api,
          componentType: formData.component,
          quantityUnits: formData.unitsRequired,
          recipientInfo,
          latitude: 0,
          longitude: 0,
        },
      });

      setSubmitted(true);
      toast.success("Emergency request submitted successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to submit request. Please call the hotline directly."
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Your emergency blood request has been received. Our team will contact you within 15 minutes
              to confirm the request.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600">
                <strong>Reference Number:</strong> EB-{Date.now().toString().slice(-8)}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = "/"}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Return to Home
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    requesterName: "",
                    requesterPhone: "",
                    requesterEmail: "",
                    hospitalName: "",
                    hospitalAddress: "",
                    patientInfo: "",
                    bloodTypeShort: "",
                    component: "WHOLE_BLOOD",
                    unitsRequired: 1,
                    urgency: "MEDIUM",
                    requiredDate: "",
                    notes: "",
                  });
                }}
                className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-red-100 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Emergency Blood Request</h1>
              <p className="text-red-100">Submit urgent blood needs for your patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Type Toggle */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-2 flex">
          <button
            onClick={() => setRequestType("hospital")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              requestType === "hospital"
                ? "bg-red-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Building className="w-5 h-5" />
            Hospital / Medical Center
          </button>
          <button
            onClick={() => setRequestType("public")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              requestType === "public"
                ? "bg-red-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="w-5 h-5" />
            Public / Individual
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Contact Information */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Dr. Nguyen Van A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0912-345-678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="doctor@hospital.vn"
                />
              </div>
            </div>
          </section>

          {/* Hospital Information */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-red-600" />
              Hospital / Medical Center
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hospital Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Cho Ray Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hospital Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.hospitalAddress}
                  onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="201B Nguyen Chi Thanh, District 5, HCMC"
                />
              </div>
            </div>
          </section>

          {/* Blood Request Details */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-600" />
              Blood Request Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Blood Type Required <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.bloodTypeShort}
                  onChange={(e) => setFormData({ ...formData, bloodTypeShort: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Blood Type</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt.short} value={bt.short}>
                      {bt.short}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Blood Component <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.component}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      component: e.target.value as CreateEmergencyRequestComponentType,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {COMPONENTS.map((comp) => (
                    <option key={comp.value} value={comp.value}>
                      {comp.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Units Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={formData.unitsRequired}
                  onChange={(e) => setFormData({ ...formData, unitsRequired: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Required By <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.requiredDate}
                  onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </section>

          {/* Urgency */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Urgency Level
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {URGENCY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                    formData.urgency === level.value
                      ? `${level.color} border-current`
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={formData.urgency === level.value}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="sr-only"
                  />
                  <p className="font-bold">{level.label}</p>
                  <p className="text-xs mt-1 opacity-70">{level.description}</p>
                  {formData.urgency === level.value && (
                    <CheckCircle className="w-5 h-5 absolute top-2 right-2 opacity-50" />
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* Additional Information */}
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Patient Information (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.patientInfo}
                onChange={(e) => setFormData({ ...formData, patientInfo: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Brief patient diagnosis or medical condition..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Any special requirements or notes..."
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={createEmergencyMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {createEmergencyMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Emergency Request
                </>
              )}
            </button>
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <Phone className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Need immediate assistance?</p>
              <p className="text-sm text-red-800 mt-1">
                For life-threatening emergencies, call our 24/7 hotline: <strong>1900-XXXX</strong>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}