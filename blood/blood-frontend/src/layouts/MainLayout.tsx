import { Outlet, Link } from "react-router-dom";
import { Droplet, Activity, Users, LogOut, LayoutDashboard } from "lucide-react";

export function MainLayout() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Droplet className="w-6 h-6 text-red-500 mr-2" />
          <span className="font-bold text-xl text-slate-800">Blood Connect</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3 text-slate-500" />
            Dashboard
          </Link>
          <Link to="/requests" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <Activity className="w-5 h-5 mr-3 text-slate-400" />
            Blood Requests
          </Link>
          <Link to="/inventory" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <Droplet className="w-5 h-5 mr-3 text-slate-400" />
            Inventory
          </Link>
          <Link to="/organizations" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <Users className="w-5 h-5 mr-3 text-slate-400" />
            Organizations
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-slate-800">Workspace</h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-sm font-medium text-slate-600">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
