import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Navigation } from './Navigation';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={setIsSidebarCollapsed} />
      <main 
        className="pt-16 transition-all duration-300"
        style={{ 
          marginLeft: isSidebarCollapsed ? '80px' : '260px',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
