import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { AdminLayout } from "@/layouts/AdminLayout";
import { HospitalLayout } from "@/layouts/HospitalLayout";
import { MedicalCenterLayout } from "@/layouts/MedicalCenterLayout";
import { DonorLayout } from "@/layouts/DonorLayout";

// Features - Public Pages
import { LandingPage } from "@/features/landing/LandingPage";
import { DonationCentersPage } from "@/features/centers/DonationCentersPage";
import { EligibilityCheckPage } from "@/features/eligibility/EligibilityCheckPage";
import { BloodCompatibilityPage } from "@/features/compatibility/BloodCompatibilityPage";
import { EmergencyRequestPage } from "@/features/emergency/EmergencyRequestPage";

// Features - Auth
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { UnauthorizedPage } from "@/features/auth/UnauthorizedPage";

// Features - Settings / Profile (authenticated, any role)
import { SettingsPage } from "@/features/settings/SettingsPage";
import { ProfilePage } from "@/features/profile/ProfilePage";

// Features - Dashboard (Authenticated)
import { DonorDashboardPage } from "@/features/dashboard/DonorDashboardPage";
import { BloodRequestsPage } from "@/features/bloodrequest/BloodRequestsPage";

// Features - Admin Portal
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { OrganizationApprovalQueue } from "@/features/admin/OrganizationApprovalQueue";
import { AuditLogViewer } from "@/features/admin/AuditLogViewer";

// Features - Hospital Portal
import { HospitalDashboard } from "@/features/hospital/HospitalDashboard";
import { HospitalRequestForm } from "@/features/hospital/HospitalRequestForm";
import { HospitalInventoryView } from "@/features/hospital/HospitalInventoryView";

// Features - Medical Center Portal
import { MedicalCenterDashboard } from "@/features/medicalcenter/MedicalCenterDashboard";
import { DailyOperationsBoard } from "@/features/medicalcenter/DailyOperationsBoard";
import { LabTestEntryForm } from "@/features/medicalcenter/LabTestEntryForm";

// Features - Donor Portal
import { DonorDashboard } from "@/features/donor/DonorDashboard";
import { BookAppointmentPage } from "@/features/donor/BookAppointmentPage";
import { DonorProfilePage } from "@/features/donor/DonorProfilePage";

// Features - Notifications
import { NotificationInbox } from "@/features/notifications/NotificationInbox";

// Features - Emergency Console
import { EmergencyConsole } from "@/features/emergency/EmergencyConsole";

// Features - Analytics
import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";

export const router = createBrowserRouter([
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
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Authenticated app shell - Profile & Settings (any authenticated role)
  {
    element: (
      <RoleGuard
        allowedRoles={[
          "DONOR",
          "HOSPITAL",
          "MEDICALCENTER",
          "STAFF",
          "LAB_STAFF",
          "MEDICAL_STAFF",
          "ADMIN",
          "SUPER_ADMIN",
        ]}
      >
        <MainLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
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
  {
    path: "unauthorized",
    element: <UnauthorizedPage />,
  },

  // Admin Portal Routes
  {
    path: "admin",
    element: (
      <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "organizations",
        element: <OrganizationApprovalQueue />,
      },
      {
        path: "audit",
        element: <AuditLogViewer />,
      },
      {
        path: "analytics",
        element: <AnalyticsDashboard />,
      },
      {
        path: "emergency",
        element: <EmergencyConsole />,
      },
    ],
  },

  // Hospital Portal Routes
  {
    path: "hospital",
    element: (
      <RoleGuard allowedRoles={["HOSPITAL", "ADMIN", "SUPER_ADMIN"]}>
        <HospitalLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <HospitalDashboard />,
      },
      {
        path: "request",
        element: <HospitalRequestForm />,
      },
      {
        path: "inventory",
        element: <HospitalInventoryView />,
      },
      {
        path: "emergency",
        element: <EmergencyConsole />,
      },
    ],
  },

  // Medical Center Portal Routes
  {
    path: "medicalcenter",
    element: (
      <RoleGuard
        allowedRoles={[
          "MEDICALCENTER",
          "STAFF",
          "LAB_STAFF",
          "MEDICAL_STAFF",
          "ADMIN",
          "SUPER_ADMIN",
        ]}
      >
        <MedicalCenterLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <MedicalCenterDashboard />,
      },
      {
        path: "operations",
        element: <DailyOperationsBoard />,
      },
      {
        path: "lab",
        element: <LabTestEntryForm />,
      },
      {
        path: "emergency",
        element: <EmergencyConsole />,
      },
    ],
  },

  // Donor Portal Routes
  {
    path: "donor",
    element: (
      <RoleGuard allowedRoles={["DONOR", "ADMIN", "SUPER_ADMIN"]}>
        <DonorLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DonorDashboard />,
      },
      {
        path: "book",
        element: <BookAppointmentPage />,
      },
      {
        path: "profile",
        element: <DonorProfilePage />,
      },
    ],
  },

  // Redirect /book/:centerId → /donor/book?centerId=:centerId
  {
    path: "book/:centerId",
    element: <Navigate to="donor/book" replace />,
  },

  // Notifications - accessible by all authenticated roles
  {
    path: "notifications",
    element: (
      <RoleGuard
        allowedRoles={[
          "DONOR",
          "HOSPITAL",
          "ADMIN",
          "SUPER_ADMIN",
          "MEDICALCENTER",
          "STAFF",
          "LAB_STAFF",
          "MEDICAL_STAFF",
        ]}
      >
        <MainLayout role="Notifications" />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <NotificationInbox />,
      },
    ],
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