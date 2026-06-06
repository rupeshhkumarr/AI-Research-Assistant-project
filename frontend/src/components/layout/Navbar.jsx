import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

export const Navbar = () => {
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
    <header className="h-16 border-b border-border bg-bg-sidebar/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-300">
      <h1 className="text-xl font-semibold text-text-main">{title}</h1>
    </header>
  );
};
