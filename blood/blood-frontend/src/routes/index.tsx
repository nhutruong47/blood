import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";

// Features - Public Pages
import { LandingPage } from "@/features/landing/LandingPage";
import { DonationCentersPage } from "@/features/centers/DonationCentersPage";
import { EligibilityCheckPage } from "@/features/eligibility/EligibilityCheckPage";
import { BloodCompatibilityPage } from "@/features/compatibility/BloodCompatibilityPage";
import { EmergencyRequestPage } from "@/features/emergency/EmergencyRequestPage";

// Features - Auth
import { LoginPage } from "@/features/auth/LoginPage";

// Features - Dashboard (Authenticated)
import { DonorDashboardPage } from "@/features/dashboard/DonorDashboardPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { BloodRequestsPage } from "@/features/bloodrequest/BloodRequestsPage";

export const router = createBrowserRouter([
  // Public Landing Page
  {
    path: "/",
    element: <LandingPage />,
  },

  // Auth Routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },

  // Public Feature Pages
  {
    path: "centers",
    element: <DonationCentersPage />,
  },
  {
    path: "eligibility",
    element: <EligibilityCheckPage />,
  },
  {
    path: "blood-compatibility",
    element: <BloodCompatibilityPage />,
  },
  {
    path: "emergency",
    element: <EmergencyRequestPage />,
  },

  // Authenticated Routes (Dashboard Layout)
  {
    element: <MainLayout />,
    children: [
      {
        path: "dashboard",
        element: <DonorDashboardPage />,
      },
      {
        path: "admin",
        element: <DashboardPage />,
      },
      {
        path: "requests",
        element: <BloodRequestsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
