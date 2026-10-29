import React from 'react';
import { Plus, ArrowRight, Calendar } from 'lucide-react';

import { Button } from '../ui/Button';
import { useUIStore } from '../../store/useUIStore';
import { useAuth } from '../../context/AuthContext';
import { usePlannerStore } from '../../store/usePlannerStore';

export const HeroBanner: React.FC = () => {
  const { setActiveTab } = useUIStore();
  const { user } = useAuth();
  const { formData, selectedDestination } = usePlannerStore();
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'traveler';
  const draftDestination = selectedDestination?.name || formData.destination;
  const draftStart = new Date(formData.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const draftEnd = new Date(formData.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-8 md:p-10 shadow-xl">
      {/* Background Scenic Overlay */}
      <div
        className="absolute inset-0 opacity-40 bg-cover bg-center mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1200')`,
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Welcome Copy */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-purple-300">Welcome back, {firstName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Where will your next <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-purple-300 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
              adventure
            </span> take you?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-md font-normal">
            Plan smarter. Travel better. Experience more with instant AI-tailored itineraries.
          </p>

          <div className="pt-2">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setActiveTab('planner')}
              className="gap-2 shadow-purple-500/40"
            >
              <Plus className="w-5 h-5" />
              <span>Plan New Trip</span>
            </Button>
          </div>
        </div>

        {/* Right Featured Next Trip Card Preview (Matching Switzerland Screenshot Card) */}
        <div className="lg:col-span-5">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-5 text-gray-900 dark:text-white shadow-2xl border border-white/40 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Current Planning Draft
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full">
                {formData.durationDays} Days
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {draftDestination}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{draftStart} – {draftEnd}</span>
                </p>
              </div>

              <img
                src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=300"
                alt={draftDestination}
                className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-100 dark:border-gray-800"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('trips')}
              className="w-full justify-center gap-1.5 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60"
            >
              <span>View Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
