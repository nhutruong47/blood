import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Droplet,
  LayoutDashboard,
  MapPin,
  Heart,
  AlertCircle,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Building,
  Users,
  Calendar,
  FileText,
  BarChart3,
  TestTube,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}

interface MainLayoutProps {
  children?: ReactNode;
  role?: string;
}

export function MainLayout({ children, role }: MainLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navItems: NavItem[] = (() => {
    const roleUpper = (role || user?.role || "").toUpperCase();
    if (roleUpper === "ADMIN" || roleUpper === "SUPER_ADMIN") {
      return [
        { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/admin/organizations", icon: Building, label: "Organizations" },
        { to: "/admin/audit", icon: FileText, label: "Audit Logs" },
        { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        { to: "/emergency", icon: AlertCircle, label: "Emergency" },
        { to: "/centers", icon: MapPin, label: "Centers" },
      ];
    }
    if (roleUpper === "HOSPITAL") {
      return [
        { to: "/hospital/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/hospital/request", icon: Activity, label: "New Request" },
        { to: "/hospital/inventory", icon: Droplet, label: "Inventory" },
        { to: "/emergency", icon: AlertCircle, label: "Emergency" },
        { to: "/centers", icon: MapPin, label: "Centers" },
      ];
    }
    if (roleUpper === "MEDICALCENTER" || roleUpper === "STAFF" || roleUpper === "LAB_STAFF" || roleUpper === "MEDICAL_STAFF") {
      return [
        { to: "/medicalcenter/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/medicalcenter/operations", icon: Users, label: "Daily Operations" },
        { to: "/medicalcenter/lab", icon: TestTube, label: "Lab Tests" },
        { to: "/emergency", icon: AlertCircle, label: "Emergency" },
      ];
    }
    if (roleUpper === "DONOR") {
      return [
        { to: "/donor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/donor/book", icon: Calendar, label: "Book Appointment" },
        { to: "/donor/profile", icon: Users, label: "My Profile" },
        { to: "/notifications", icon: Bell, label: "Notifications" },
        { to: "/centers", icon: MapPin, label: "Centers" },
        { to: "/eligibility", icon: Heart, label: "Eligibility" },
        { to: "/blood-compatibility", icon: Droplet, label: "Blood Types" },
      ];
    }
    return [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/centers", icon: MapPin, label: "Find Centers" },
      { to: "/eligibility", icon: Heart, label: "Eligibility" },
      { to: "/emergency", icon: AlertCircle, label: "Emergency" },
      { to: "/requests", icon: Activity, label: "Blood Requests" },
      { to: "/blood-compatibility", icon: Droplet, label: "Blood Types" },
    ];
  })();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const pageTitle = (() => {
    const item = navItems.find(n => isActive(n.to));
    return item?.label || location.pathname.replace("/", "") || "Dashboard";
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <Droplet className="w-6 h-6 text-red-600" />
            <span className="font-bold text-xl text-slate-800">Blood Connect</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {role && (
          <div className="px-4 py-3 border-b border-slate-200">
            <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">
              {role}
            </span>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.to)
                  ? "bg-red-50 text-red-700 border-l-4 border-red-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${isActive(item.to) ? "text-red-600" : "text-slate-400"}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <Link
            to="/settings"
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-5 h-5 mr-3 text-slate-400" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-slate-800 capitalize">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/emergency"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Emergency
            </Link>
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-red-600">
                {user?.firstName?.charAt(0) || "U"}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}