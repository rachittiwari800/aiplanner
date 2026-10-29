import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuth } from '../../context/AuthContext';
import { usePlannerStore } from '../../store/usePlannerStore';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, toggleSidebar, notificationsCount, setActiveTab, addNotification } = useUIStore();
  const { user } = useAuth();
  const updatePlannerForm = usePlannerStore((state) => state.updateFormData);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const destination = searchQuery.trim();
    if (!destination) return;

    updatePlannerForm({ destination });
    addNotification({
      title: 'Destination Selected',
      message: `Set "${destination}" as your target destination in AI Trip Planner.`,
      type: 'planner',
    });
    setActiveTab('planner');
  };

  return (
    <header className="min-h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 sticky top-0 z-20 transition-all">
      {/* Search Input & Mobile Sidebar Toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Where do you want to go? (e.g. Manali, Goa, Paris)"
            className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
          />
        </form>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon with Badge */}
        <button
          onClick={() => setActiveTab('notifications')}
          aria-label="Open notifications"
          className="relative p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 ? (
            <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
              {notificationsCount}
            </span>
          ) : null}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => setActiveTab('profile')}
          aria-label="Open profile"
          className="flex items-center gap-2 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt="User Profile"
            className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/40"
          />
        </button>
      </div>
    </header>
  );
};
