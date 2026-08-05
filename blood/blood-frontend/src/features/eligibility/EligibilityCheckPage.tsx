import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Activity,
  Calendar,
  Shield,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useCheckEligibility } from "@/shared/api/generated/donation-controller/donation-controller";

type Step = 0 | 1 | 2;

interface EligibilityAnswers {
  age: string;
  weightKg: string;
  hasAnemia: boolean | null;
  hasHeartDisease: boolean | null;
  hasFeverOrInfection: boolean | null;
  hasHIV: boolean | null;
  hasHepatitis: boolean | null;
  hadRecentSurgery: boolean | null;
  isPregnant: boolean | null;
  isBreastfeeding: boolean | null;
  consumesAlcohol: boolean | null;
  takesMedication: boolean | null;
  hadRecentTattooOrPiercing: boolean | null;
}

interface EligibilityResult {
  status: "ELIGIBLE" | "NEEDS_REVIEW" | "NOT_ELIGIBLE";
  canProceed: boolean;
  reasons: string[];
  message: string;
}

const STEP_LABELS = ["Basic Info", "Health Conditions", "Lifestyle"];

const HEALTH_CONDITIONS: Array<{
  key: keyof EligibilityAnswers;
  label: string;
  description: string;
}> = [
  { key: "hasAnemia", label: "Anemia or low iron", description: "Diagnosed with anemia or low hemoglobin" },
  { key: "hasHeartDisease", label: "Heart disease", description: "Any heart condition or cardiovascular issues" },
  { key: "hasFeverOrInfection", label: "Fever or active infection", description: "Currently feverish, unwell, or fighting an infection" },
  { key: "hasHIV", label: "HIV+", description: "HIV positive status" },
  { key: "hasHepatitis", label: "Hepatitis", description: "Any form of hepatitis infection" },
  { key: "hadRecentSurgery", label: "Recent surgery (last 6 months)", description: "Major surgery in the past 6 months" },
  { key: "isPregnant", label: "Currently pregnant", description: "Pregnant or trying to conceive" },
  { key: "isBreastfeeding", label: "Breastfeeding", description: "Currently breastfeeding" },
];

const LIFESTYLE_FACTORS: Array<{
  key: keyof EligibilityAnswers;
  label: string;
  description: string;
}> = [
  { key: "consumesAlcohol", label: "Regular alcohol consumption", description: "Alcohol within 24 hours of donation" },
  { key: "takesMedication", label: "Currently on medication", description: "Prescribed or over-the-counter medication" },
  { key: "hadRecentTattooOrPiercing", label: "Recent tattoo or piercing (last 6 months)", description: "Body art procedures" },
];

export function EligibilityCheckPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<EligibilityAnswers>({
    age: "",
    weightKg: "",
    hasAnemia: null,
    hasHeartDisease: null,
    hasFeverOrInfection: null,
    hasHIV: null,
    hasHepatitis: null,
    hadRecentSurgery: null,
    isPregnant: null,
    isBreastfeeding: null,
    consumesAlcohol: null,
    takesMedication: null,
    hadRecentTattooOrPiercing: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const checkMutation = useCheckEligibility();

  const validateStep = (s: Step): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 0) {
      const age = parseInt(answers.age);
      if (!answers.age || isNaN(age)) {
        newErrors.age = "Age is required";
      } else if (age < 18) {
        newErrors.age = "You must be at least 18 years old to donate";
      } else if (age > 65) {
        newErrors.age = "Maximum donor age is 65";
      }
      const weight = parseFloat(answers.weightKg);
      if (!answers.weightKg || isNaN(weight)) {
        newErrors.weightKg = "Weight is required";
      } else if (weight < 45) {
        newErrors.weightKg = "You must weigh at least 45 kg to donate";
      }
    } else {
      const fields = s === 1 ? HEALTH_CONDITIONS : LIFESTYLE_FACTORS;
      fields.forEach((f) => {
        if (answers[f.key] === null) {
          newErrors[f.key] = "Please answer this question";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    if (step === 2) {
      await submit();
    } else {
      setStep((s) => (s + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      navigate(-1);
    } else {
      setErrors({});
      setStep((s) => (s - 1) as Step);
    }
  };

  const submit = async () => {
    const payload = {
      age: parseInt(answers.age) || 0,
      weightKg: parseFloat(answers.weightKg) || 0,
      feelingWell: !(
        answers.hasAnemia ||
        answers.hasHeartDisease ||
        answers.hasFeverOrInfection ||
        answers.hasHIV ||
        answers.hasHepatitis
      ),
      hasFeverOrInfection: answers.hasFeverOrInfection ?? false,
      recentlyTattooedOrPierced: answers.hadRecentTattooOrPiercing ?? false,
      pregnantOrRecentlyPregnant: answers.isPregnant ?? answers.isBreastfeeding ?? false,
      takingAntibiotics: answers.takesMedication ?? false,
      hadRecentSurgery: answers.hadRecentSurgery ?? false,
    };

    try {
      const res = await checkMutation.mutateAsync({ data: payload as any });
      const responseBody = res as any;
      const apiData = responseBody?.data?.data ?? responseBody?.data;
      if (!apiData) {
        toast.error("Invalid response from server");
        return;
      }
      const status = apiData.status as "ELIGIBLE" | "NEEDS_REVIEW" | "TEMPORARILY_DEFERRED";
      const mapped: EligibilityResult["status"] =
        status === "ELIGIBLE"
          ? "ELIGIBLE"
          : status === "NEEDS_REVIEW"
          ? "NEEDS_REVIEW"
          : "NOT_ELIGIBLE";
      setResult({
        status: mapped,
        canProceed: apiData.canProceedToBooking ?? false,
        reasons: apiData.reasons ?? [],
        message: apiData.nextStep ?? getDefaultMessage(mapped),
      });
    } catch (err) {
      toast.warning("Server unavailable, using local evaluation");
      setResult(evaluateLocally());
    }
  };

  const evaluateLocally = (): EligibilityResult => {
    const reasons: string[] = [];
    let status: EligibilityResult["status"] = "ELIGIBLE";
    const age = parseInt(answers.age);
    const weight = parseFloat(answers.weightKg);

    if (age < 18 || age > 65) {
      reasons.push("Age must be between 18 and 65");
      status = "NOT_ELIGIBLE";
    }
    if (weight < 45) {
      reasons.push("Minimum weight requirement is 45 kg");
      status = "NOT_ELIGIBLE";
    }
    if (answers.hasAnemia) {
      reasons.push("Anemia requires medical evaluation");
      status = "NOT_ELIGIBLE";
    }
    if (answers.hasHeartDisease) {
      reasons.push("Heart disease may prevent donation");
      status = "NOT_ELIGIBLE";
    }
    if (answers.hasFeverOrInfection) {
      reasons.push("Fever or active infection requires temporary deferral");
      status = "NEEDS_REVIEW";
    }
    if (answers.hasHIV || answers.hasHepatitis) {
      reasons.push("Certain infections permanently defer donation");
      status = "NOT_ELIGIBLE";
    }
    if (answers.hadRecentSurgery) {
      reasons.push("Recent surgery requires 6-month deferral");
      status = "NEEDS_REVIEW";
    }
    if (answers.isPregnant || answers.isBreastfeeding) {
      reasons.push("Pregnancy and breastfeeding require temporary deferral");
      status = "NEEDS_REVIEW";
    }
    if (answers.takesMedication) {
      reasons.push("Medication review required on-site");
      status = "NEEDS_REVIEW";
    }
    if (answers.hadRecentTattooOrPiercing) {
      reasons.push("Recent tattoo/piercing requires 6-month deferral");
      status = "NEEDS_REVIEW";
    }
    if (answers.consumesAlcohol) {
      reasons.push("Avoid alcohol 24 hours before donation");
      status = "NEEDS_REVIEW";
    }
    return {
      status,
      canProceed: status !== "NOT_ELIGIBLE",
      reasons,
      message: getDefaultMessage(status),
    };
  };

  const getDefaultMessage = (status: EligibilityResult["status"]): string => {
    if (status === "ELIGIBLE") {
      return "Great news! Based on your answers, you appear eligible to donate blood. Please proceed to find a donation center near you.";
    }
    if (status === "NEEDS_REVIEW") {
      return "Based on your answers, you may still be eligible. Our medical staff will review your responses on-site before donation.";
    }
    return "Unfortunately, based on your answers you cannot donate at this time. Please review the reasons below and try again when conditions change.";
  };

  const reset = () => {
    setStep(0);
    setAnswers({
      age: "",
      weightKg: "",
      hasAnemia: null,
      hasHeartDisease: null,
      hasFeverOrInfection: null,
      hasHIV: null,
      hasHepatitis: null,
      hadRecentSurgery: null,
      isPregnant: null,
      isBreastfeeding: null,
      consumesAlcohol: null,
      takesMedication: null,
      hadRecentTattooOrPiercing: null,
    });
    setErrors({});
    setResult(null);
  };

  if (result) {
    return <ResultView result={result} onReset={reset} />;
  }

  const progress = ((step + 1) / 3) * 100;

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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Eligibility Check</h1>
              <p className="text-red-100">3 quick steps to know if you can donate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">
              Step {step + 1} of 3: {STEP_LABELS[step]}
            </span>
            <span className="text-sm font-semibold text-red-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <ol className="flex justify-between text-xs" aria-label="Progress steps">
            {STEP_LABELS.map((label, i) => (
              <li
                key={label}
                className={`flex items-center gap-1 ${
                  i <= step ? "text-red-600 font-semibold" : "text-slate-400"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                    i < step
                      ? "bg-red-600 text-white"
                      : i === step
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
            <span className="text-sm text-slate-500">{STEP_LABELS[step]}</span>
          </div>

          {step === 0 && <BasicInfoStep answers={answers} errors={errors} setAnswers={setAnswers} />}
          {step === 1 && <CheckboxStep answers={answers} errors={errors} setAnswers={setAnswers} fields={HEALTH_CONDITIONS} />}
          {step === 2 && <CheckboxStep answers={answers} errors={errors} setAnswers={setAnswers} fields={LIFESTYLE_FACTORS} />}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all text-slate-700 hover:bg-slate-100"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={checkMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {checkMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : step === 2 ? (
              <>
                See Result
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Your answers are confidential</p>
            <p className="mt-1">
              This information is used only to determine your eligibility. All responses are kept private and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  answers: EligibilityAnswers;
  errors: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<EligibilityAnswers>>;
}

function BasicInfoStep({ answers, errors, setAnswers }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Tell us about yourself</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">
            Age (years) <span className="text-red-500">*</span>
          </label>
          <input
            id="age"
            type="number"
            min={18}
            max={65}
            placeholder="e.g. 30"
            value={answers.age}
            onChange={(e) => setAnswers((a) => ({ ...a, age: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
            aria-invalid={!!errors.age}
            aria-describedby={errors.age ? "age-error" : undefined}
          />
          {errors.age && (
            <p id="age-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {errors.age}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-slate-700 mb-2">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            id="weight"
            type="number"
            min={45}
            placeholder="e.g. 65"
            value={answers.weightKg}
            onChange={(e) => setAnswers((a) => ({ ...a, weightKg: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
            aria-invalid={!!errors.weightKg}
            aria-describedby={errors.weightKg ? "weight-error" : undefined}
          />
          {errors.weightKg && (
            <p id="weight-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {errors.weightKg}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Donors must be between 18 and 65 years old, and weigh at least 45 kg.
      </p>
    </div>
  );
}

interface CheckboxStepProps extends StepProps {
  fields: Array<{ key: keyof EligibilityAnswers; label: string; description: string }>;
}

function CheckboxStep({ answers, errors, setAnswers, fields }: CheckboxStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Please answer the following</h2>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <fieldset>
              <legend className="font-semibold text-slate-900 mb-1">{f.label}</legend>
              <p className="text-xs text-slate-500 mb-2">{f.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: false, label: "No" },
                  { value: true, label: "Yes" },
                ].map((opt) => (
                  <label
                    key={String(opt.value)}
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all font-medium ${
                      answers[f.key] === opt.value
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={f.key}
                      checked={answers[f.key] === opt.value}
                      onChange={() => setAnswers((a) => ({ ...a, [f.key]: opt.value }))}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
            {errors[f.key] && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors[f.key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultView({ result, onReset }: { result: EligibilityResult; onReset: () => void }) {
  const statusConfig = {
    ELIGIBLE: {
      icon: CheckCircle,
      title: "You're Eligible to Donate!",
      bg: "bg-green-50",
      border: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
    },
    NEEDS_REVIEW: {
      icon: AlertCircle,
      title: "Needs Review",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800",
    },
    NOT_ELIGIBLE: {
      icon: XCircle,
      title: "Cannot Donate Right Now",
      bg: "bg-red-50",
      border: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
    },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${config.bg} border-2 ${config.border} rounded-2xl p-8 text-center`}>
          <div
            className={`w-20 h-20 ${config.bg} border-4 ${config.border} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <Icon className={`w-10 h-10 ${config.iconColor}`} aria-hidden="true" />
          </div>

          <h1 className={`text-2xl font-bold ${config.titleColor} mb-4`}>{config.title}</h1>

          <p className="text-slate-700 text-base leading-relaxed mb-6">{result.message}</p>

          {result.reasons.length > 0 && (
            <div className="text-left bg-white/80 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-sm text-slate-700 mb-2">Reasons:</p>
              {result.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-slate-700">{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {result.canProceed && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" aria-hidden="true" />
              Ready to save lives?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/centers"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                <Calendar className="w-5 h-5" aria-hidden="true" />
                Find a Center
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            Retake Eligibility Check
          </button>
        </div>

        <div className="mt-8 p-4 bg-slate-100 rounded-xl">
          <p className="text-sm text-slate-600 text-center">
            <strong>Note:</strong> This is a preliminary check only. Final eligibility is determined by medical staff on-site.
          </p>
        </div>
      </div>
    </div>
  );
}
