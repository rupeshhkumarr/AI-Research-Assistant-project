import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';

export const Navbar = ({ onMenuClick }) => {
  const location = useLocation();

  const routeNames = {
    '/': 'Dashboard',
    '/upload': 'Upload Documents',
    '/chat': 'AI Chat',
    '/documents': 'Document Library',
    '/settings': 'Settings',
  };

  const title = routeNames[location.pathname] || 'Research Assistant';

  return (
    <header className="h-16 border-b border-border bg-bg-sidebar/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-text-muted hover:text-text-main md:hidden rounded-lg hover:bg-bg-hover transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-text-main">{title}</h1>
      </div>
    </header>
  );
};
