import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Luggage,
  MessageSquare,
  Plane,
  Building2,
  MapPin,
  CloudSun,
  Wallet,
  CheckSquare,
  FileText,
  Bell,
  User as UserIcon,
  Settings,
  Moon,
  Sun,
  Compass,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'AI Trip Planner', icon: Sparkles },
  { id: 'trips', label: 'Trips', icon: Luggage },
  { id: 'chat', label: 'AI Chat Assistant', icon: MessageSquare },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Building2 },
  { id: 'maps', label: 'Maps', icon: MapPin },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'budget', label: 'Budget Planner', icon: Wallet },
  { id: 'packing', label: 'Packing List', icon: CheckSquare },
  { id: 'visa', label: 'Visa Info', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, isSidebarOpen, notificationsCount } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between p-4 fixed left-0 top-0 z-30 transition-all duration-300">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
              Wayfarer
            </h1>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold tracking-wide">
              Travel, thoughtfully planned.
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-semibold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'notifications' && notificationsCount > 0 ? (
                  <span className="px-2 py-0.5 text-xs bg-purple-600 text-white font-bold rounded-full">
                    {notificationsCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & User Profile */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        {/* Dark Mode Switch */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
          <div className="flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-purple-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>Dark Mode</span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'dark'}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
              theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* User Card with Logout */}
        <div className="flex items-center justify-between gap-2 p-2 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={user?.name || 'User Profile'}
              className="w-9 h-9 rounded-full object-cover border border-purple-200 dark:border-purple-900 shrink-0"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {user?.name || 'Traveler'}
              </h4>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium truncate">
                {user?.isPremium ? 'Premium Member' : 'Free Plan'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
