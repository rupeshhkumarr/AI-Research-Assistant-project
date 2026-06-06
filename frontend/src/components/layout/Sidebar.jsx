import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, MessageSquare, Library, Settings, Moon, Sun, LogOut, User, ChevronUp, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthContext } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { theme, setDarkTheme, setLightTheme } = useThemeContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Library', path: '/documents', icon: Library },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-border bg-bg-sidebar flex flex-col z-40 transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-white text-sm">AI</span>
          </div>
          <span className="font-semibold text-lg text-text-main tracking-tight">Research.ai</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary-600/10 text-primary-500" 
                  : "text-text-muted hover:bg-bg-hover hover:text-text-main"
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}

        <div className="mt-8 mb-4">
          <p className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Appearance</p>
          <div className="flex items-center justify-between bg-bg-hover rounded-xl p-1">
            <button 
              onClick={setLightTheme}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors", theme === 'light' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted')}
            >
              <Sun size={16} /> Light
            </button>
            <button 
              onClick={setDarkTheme}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors", theme === 'dark' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted')}
            >
              <Moon size={16} /> Dark
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border relative">
        {showProfileMenu && (
          <div className="absolute bottom-[100%] left-4 right-4 mb-2 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-50">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium text-text-main truncate">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
            <button onClick={handleSwitchAccount} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text-main transition-colors text-left">
              <RefreshCw size={16} /> Switch Account
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left">
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
        
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-bg-hover transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary-600/20 text-primary-500 flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-medium text-text-main truncate">{user?.user_metadata?.full_name || 'User Profile'}</p>
            <p className="text-xs text-text-muted truncate">{user?.email || 'Settings & more'}</p>
          </div>
          <ChevronUp size={16} className={cn("text-text-muted transition-transform duration-200", showProfileMenu && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
};
