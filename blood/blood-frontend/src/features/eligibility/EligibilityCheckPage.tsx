import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "sonner";
import { useCheckEligibility } from "@/shared/api/generated/donation-controller/donation-controller";

interface Question {
  id: keyof EligibilityAnswers;
  question: string;
  type: "number" | "boolean" | "date";
  placeholder?: string;
  validate?: (value: string | boolean) => string | null;
  optional?: boolean;
}

interface EligibilityAnswers {
  age: string;
  weightKg: string;
  feelingWell: boolean | null;
  hasFeverOrInfection: boolean | null;
  recentlyTattooedOrPierced: boolean | null;
  pregnantOrRecentlyPregnant: boolean | null;
  takingAntibiotics: boolean | null;
  hadRecentSurgery: boolean | null;
  lastDonationDate: string;
}

interface EligibilityResult {
  status: "eligible" | "needs_review" | "deferred";
  canProceed: boolean;
  reasons: string[];
  message: string;
  nextStep?: string;
}

const QUESTIONS: Question[] = [
  {
    id: "age",
    question: "What is your age?",
    type: "number",
    placeholder: "Enter your age",
    validate: (value) => {
      const age = parseInt(value as string);
      if (isNaN(age)) return "Please enter a valid age";
      if (age < 16) return "You must be at least 16 years old to donate";
      if (age > 70) return "Donors over 70 may need additional medical clearance";
      return null;
    },
  },
  {
    id: "weightKg",
    question: "What is your weight (in kg)?",
    type: "number",
    placeholder: "Enter your weight",
    validate: (value) => {
      const weight = parseFloat(value as string);
      if (isNaN(weight)) return "Please enter a valid weight";
      if (weight < 30) return "You must weigh at least 30 kg to donate";
      return null;
    },
  },
  {
    id: "feelingWell",
    question: "Are you feeling well today?",
    type: "boolean",
  },
  {
    id: "hasFeverOrInfection",
    question: "Do you currently have a fever or active infection?",
    type: "boolean",
  },
  {
    id: "takingAntibiotics",
    question: "Are you currently taking antibiotics?",
    type: "boolean",
  },
  {
    id: "recentlyTattooedOrPierced",
    question: "Have you had a tattoo or body piercing in the last 6 months?",
    type: "boolean",
  },
  {
    id: "pregnantOrRecentlyPregnant",
    question: "Are you currently pregnant or have given birth in the last 12 months?",
    type: "boolean",
  },
  {
    id: "hadRecentSurgery",
    question: "Have you had any surgery or major dental work in the last 6 months?",
    type: "boolean",
  },
  {
    id: "lastDonationDate",
    question: "When was your last blood donation (if any)?",
    type: "date",
    optional: true,
  },
];

export function EligibilityCheckPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<EligibilityAnswers>({
    age: "",
    weightKg: "",
    feelingWell: null,
    hasFeverOrInfection: null,
    takingAntibiotics: null,
    recentlyTattooedOrPierced: null,
    pregnantOrRecentlyPregnant: null,
    hadRecentSurgery: null,
    lastDonationDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const checkEligibilityMutation = useCheckEligibility();

  const currentQuestion = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const validateCurrentStep = () => {
    if (!currentQuestion) return true;

    if (currentQuestion.optional && !answers[currentQuestion.id]) return true;

    const value = answers[currentQuestion.id];
    if ((value === null || value === "") && !currentQuestion.optional) {
      setErrors({ [currentQuestion.id]: "This field is required" });
      return false;
    }

    if (currentQuestion.validate && typeof value !== "boolean") {
      const error = currentQuestion.validate(value as string);
      if (error) {
        setErrors({ [currentQuestion.id]: error });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (isLastStep) {
      await submitToBackend();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleInputChange = (value: string | boolean) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
    if (errors[currentQuestion.id]) {
      setErrors({});
    }
  };

  const submitToBackend = async () => {
    const payload = {
      age: parseInt(answers.age) || undefined,
      weightKg: parseFloat(answers.weightKg) || undefined,
      feelingWell: answers.feelingWell ?? false,
      hasFeverOrInfection: answers.hasFeverOrInfection ?? false,
      takingAntibiotics: answers.takingAntibiotics ?? false,
      recentlyTattooedOrPierced: answers.recentlyTattooedOrPierced ?? false,
      pregnantOrRecentlyPregnant: answers.pregnantOrRecentlyPregnant ?? false,
      hadRecentSurgery: answers.hadRecentSurgery ?? false,
      lastDonationDate: answers.lastDonationDate || undefined,
    };

    try {
      const response = await checkEligibilityMutation.mutateAsync({ data: payload });
      const data = (response?.data as any)?.data;

      if (!data) {
        toast.error("Invalid response from server");
        return;
      }

      const status =
        data.status === "ELIGIBLE"
          ? "eligible"
          : data.status === "NEEDS_REVIEW"
          ? "needs_review"
          : "deferred";

      setResult({
        status,
        canProceed: data.canProceedToBooking ?? false,
        reasons: data.reasons ?? [],
        message: data.nextStep ?? getDefaultMessage(status),
        nextStep: data.nextStep,
      });
    } catch (err) {
      // Fallback to local calculation on error so the UX is preserved
      toast.warning("Server unavailable, using local evaluation");
      const localResult = calculateResultLocally();
      setResult(localResult);
    }
  };

  const calculateResultLocally = (): EligibilityResult => {
    const reasons: string[] = [];
    let status: "eligible" | "needs_review" | "deferred" = "eligible";

    const age = parseInt(answers.age);
    if (age < 16) {
      reasons.push("You must be at least 16 years old to donate blood");
      status = "deferred";
    } else if (age > 70) {
      reasons.push("Donors over 70 may need additional medical clearance from a doctor");
      status = "needs_review";
    }

    const weight = parseFloat(answers.weightKg);
    if (weight < 30) {
      reasons.push("You must weigh at least 30 kg to donate blood");
      status = "deferred";
    }

    if (answers.feelingWell === false) {
      reasons.push("You should be feeling well on the day of donation");
      status = "deferred";
    }

    if (answers.hasFeverOrInfection === true) {
      reasons.push("Fever or active infection requires complete recovery before donation");
      status = "deferred";
    }

    if (answers.takingAntibiotics === true) {
      reasons.push("Please complete your antibiotic course before donating");
      status = "needs_review";
    }

    if (answers.recentlyTattooedOrPierced === true) {
      reasons.push("Please wait at least 6 months after getting a tattoo or piercing");
      status = "needs_review";
    }

    if (answers.pregnantOrRecentlyPregnant === true) {
      reasons.push("Please wait at least 12 months after childbirth before donating");
      status = "needs_review";
    }

    if (answers.hadRecentSurgery === true) {
      reasons.push("Please wait at least 6 months after surgery before donating");
      status = "needs_review";
    }

    return {
      status,
      canProceed: status !== "deferred",
      reasons,
      message: getDefaultMessage(status),
    };
  };

  const getDefaultMessage = (status: "eligible" | "needs_review" | "deferred"): string => {
    if (status === "eligible") {
      return "Great news! You appear to be eligible to donate blood. You can proceed to book an appointment.";
    } else if (status === "needs_review") {
      return "You may still be able to donate, but our medical staff will review your answers on-site before donation.";
    }
    return "Unfortunately, you cannot donate at this time. Please review the reasons below and try again when the conditions are resolved.";
  };

  const resetCheck = () => {
    setCurrentStep(0);
    setAnswers({
      age: "",
      weightKg: "",
      feelingWell: null,
      hasFeverOrInfection: null,
      takingAntibiotics: null,
      recentlyTattooedOrPierced: null,
      pregnantOrRecentlyPregnant: null,
      hadRecentSurgery: null,
      lastDonationDate: "",
    });
    setErrors({});
    setResult(null);
  };

  if (result) {
    return <EligibilityResultView result={result} onReset={resetCheck} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Eligibility Check</h1>
              <p className="text-red-100">Answer a few quick questions to see if you can donate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-red-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-slate-500">Quick Check</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === "number" && (
            <div>
              <input
                type="number"
                placeholder={currentQuestion.placeholder}
                value={(answers[currentQuestion.id] as string) || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
              {errors[currentQuestion.id] && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors[currentQuestion.id]}
                </p>
              )}
            </div>
          )}

          {currentQuestion.type === "boolean" && (
            <div className="space-y-3">
              {[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ].map((option) => (
                <label
                  key={String(option.value)}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    answers[currentQuestion.id] === option.value
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={String(option.value)}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={() => handleInputChange(option.value)}
                    className="w-5 h-5 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-slate-700">{option.label}</span>
                </label>
              ))}
              {errors[currentQuestion.id] && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors[currentQuestion.id]}
                </p>
              )}
            </div>
          )}

          {currentQuestion.type === "date" && (
            <div>
              <input
                type="date"
                value={(answers[currentQuestion.id] as string) || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
              <p className="mt-2 text-sm text-slate-500">
                Leave empty if this is your first time donating
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={isFirstStep}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              isFirstStep
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={checkEligibilityMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {checkEligibilityMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : isLastStep ? (
              <>
                See Results
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Your answers are confidential</p>
            <p className="mt-1">
              This information is used only to determine your eligibility to donate blood. All
              responses are kept private and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EligibilityResultView({
  result,
  onReset,
}: {
  result: EligibilityResult;
  onReset: () => void;
}) {
  const statusConfig = {
    eligible: {
      icon: CheckCircle,
      title: "You're Eligible to Donate!",
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
    },
    needs_review: {
      icon: AlertCircle,
      title: "May Need Review",
      color: "yellow",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800",
    },
    deferred: {
      icon: XCircle,
      title: "Cannot Donate Right Now",
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
    },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-2xl p-8 text-center`}>
          <div
            className={`w-20 h-20 ${config.bgColor} border-4 ${config.borderColor} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>

          <h1 className={`text-2xl font-bold ${config.titleColor} mb-4`}>{config.title}</h1>

          <p className="text-slate-700 text-lg leading-relaxed mb-6">{result.message}</p>

          {result.reasons.length > 0 && (
            <div className="text-left bg-white/80 rounded-xl p-4 space-y-2">
              {result.reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {result.canProceed && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Ready to Save Lives?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/centers"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Book Appointment
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
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
            <ChevronLeft className="w-5 h-5" />
            Retake Eligibility Check
          </button>
        </div>

        <div className="mt-8 p-4 bg-slate-100 rounded-xl">
          <p className="text-sm text-slate-600 text-center">
            <strong>Note:</strong> This is a preliminary check only. Final eligibility is determined by
            our medical staff on-site. If you have any questions or concerns, please consult with a
            healthcare professional before donating.
          </p>
        </div>
      </div>
    </div>
  );
}