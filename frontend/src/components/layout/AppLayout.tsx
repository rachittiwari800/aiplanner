import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIChatWidget } from '../chat/AIChatWidget';
import { WeatherWidget } from '../weather/WeatherWidget';
import { useUIStore } from '../../store/useUIStore';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSidebarOpen, isChatOpen, toggleSidebar } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />
      {isSidebarOpen ? (
        <button
          aria-label="Close navigation"
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
        />
      ) : null}

      {/* Main App Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
        <Header />

        {/* Dashboard 3-Column Layout */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Main Center Feed */}
            <div className="xl:col-span-8 space-y-6">
              {children}
            </div>

            {/* Right Assistant Panel */}
            <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-22">
              {isChatOpen 
              ? <AIChatWidget /> : null}
              <WeatherWidget />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
