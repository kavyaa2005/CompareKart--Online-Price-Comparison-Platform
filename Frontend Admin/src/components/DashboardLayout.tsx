import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Database, 
  GitCompare, 
  TrendingUp, 
  Shield, 
  Users, 
  Search,
  Bell,
  Settings,
  FileCode
} from "lucide-react";
import { useState } from "react";
import { useSystemLogs } from "../hooks/useApi";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Dataset Management", path: "/datasets", icon: Database },
  { name: "Product Matching", path: "/matching", icon: GitCompare },
  { name: "Price Intelligence", path: "/pricing", icon: TrendingUp },
  { name: "Review & Trust Analysis", path: "/reviews", icon: Shield },
  { name: "User Analytics", path: "/analytics", icon: Users },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: logsData } = useSystemLogs(100);

  const notificationCount = (logsData?.logs ?? []).filter((log) => {
    const lvl = String(log.level || "").toLowerCase();
    return lvl === "warning" || lvl === "error";
  }).length;

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (!query) {
      return;
    }
    navigate(`/pricing?product=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex h-screen bg-[#0a0e1a]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f1419] border-r border-[#252d3f]/50 flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-[#252d3f]/50">
          <TrendingUp className="w-7 h-7 text-[#3b82f6]" />
          <div className="ml-3">
            <div className="text-base font-semibold text-[#f8fafc] tracking-tight">AI Price Intel</div>
            <div className="text-xs text-[#64748b] mt-0.5">Enterprise Platform</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto">
          <div className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1a1f2e] text-[#f8fafc] shadow-sm border-l-2 border-[#3b82f6] ml-0"
                      : "text-[#94a3b8] hover:bg-[#141922] hover:text-[#cbd5e1]"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Items */}
        <div className="p-4 border-t border-[#252d3f]/50 space-y-1">
          <Link
            to="/settings"
            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              location.pathname === "/settings"
                ? "bg-[#1a1f2e] text-[#f8fafc] shadow-sm"
                : "text-[#94a3b8] hover:bg-[#141922] hover:text-[#cbd5e1]"
            }`}
          >
            <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
            Settings
          </Link>
          <Link
            to="/logs"
            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              location.pathname === "/logs"
                ? "bg-[#1a1f2e] text-[#f8fafc] shadow-sm"
                : "text-[#94a3b8] hover:bg-[#141922] hover:text-[#cbd5e1]"
            }`}
          >
            <FileCode className="w-5 h-5 mr-3 flex-shrink-0" />
            Logs
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-20 bg-[#0f1419] border-b border-[#252d3f]/50 flex items-center justify-between px-8">
          {/* Search */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search datasets, models, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-[#1a1f2e] border border-[#252d3f] rounded-lg text-sm text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-all"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6 ml-8">
            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-[#1a1f2e] rounded-lg transition-all">
              <Bell className="w-5 h-5 text-[#94a3b8]" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full ring-2 ring-[#0f1419]"></span>
              )}
            </button>

            {/* Profile */}
            <div className="flex items-center gap-4 pl-6 border-l border-[#252d3f]/50">
              <div className="text-right">
                <div className="text-sm font-medium text-[#f8fafc]">Admin User</div>
                <div className="text-xs text-[#64748b] mt-0.5">System Administrator</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0a0e1a] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}