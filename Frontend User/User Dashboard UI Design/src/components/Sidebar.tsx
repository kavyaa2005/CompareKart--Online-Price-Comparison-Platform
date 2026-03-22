import React from 'react';
import { Link, useLocation } from 'react-router';
import { LayoutDashboard, GitCompare, TrendingUp, Sparkles, Heart, Bell, Settings, ChevronLeft, ChevronRight, UserCircle2 } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/search', label: 'Product Compare', icon: GitCompare },
    { path: '/price-history', label: 'Price History', icon: TrendingUp },
    { path: '/recommendations', label: 'AI Insights', icon: Sparkles },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/profile', label: 'Profile', icon: UserCircle2 },
    { path: '/preferences', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className="fixed left-0 top-16 bottom-0 border-r backdrop-blur-md overflow-y-auto transition-all duration-300"
      style={{
        backgroundColor: 'var(--surface-background)',
        borderColor: 'var(--border)',
        width: isCollapsed ? '80px' : '260px',
      }}
    >
      {/* Collapse Toggle */}
      <div className="p-4 flex justify-end">
        <button
          onClick={() => onToggleCollapse(!isCollapsed)}
          className="p-2 rounded-lg hover-lift ripple-effect"
          style={{ backgroundColor: 'var(--background)' }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          ) : (
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="px-3 pb-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all relative group"
              style={{
                backgroundColor: active ? 'var(--secondary)' : 'transparent',
                color: active ? 'white' : 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--background)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {active && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                  style={{ backgroundColor: 'white' }}
                />
              )}
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity"
                  style={{ backgroundColor: 'var(--text-primary)', color: 'white', fontSize: '12px' }}>
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
