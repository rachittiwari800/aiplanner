import React from 'react';
import { Card } from '../ui/Card';
import { useUIStore } from '../../store/useUIStore';
import { usePlannerStore } from '../../store/usePlannerStore';

const destinations = [
  {
    id: 'dest_manali',
    name: 'Manali',
    country: 'Himachal Pradesh, India',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'dest_goa',
    name: 'Goa',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'dest_jaipur',
    name: 'Jaipur',
    country: 'Rajasthan, India',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'dest_ladakh',
    name: 'Ladakh',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'dest_kerala',
    name: 'Kerala',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'dest_varanasi',
    name: 'Varanasi',
    country: 'Uttar Pradesh, India',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'dest_paris',
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'dest_tokyo',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=400',
  },
];

export const PopularDestinations: React.FC = () => {
  const { setActiveTab } = useUIStore();
  const updatePlannerForm = usePlannerStore((state) => state.updateFormData);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Popular Destinations</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Click any destination to start planning your custom itinerary</p>
        </div>
        <button
          onClick={() => setActiveTab('planner')}
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
        >
          Open Planner
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
        {destinations.map((dest) => (
          <Card
            key={dest.id}
            onClick={() => {
              updatePlannerForm({ destination: dest.name });
              setActiveTab('planner');
            }}
            className="p-2.5 cursor-pointer group hover:scale-[1.02] transition-all duration-200 border border-gray-100 dark:border-gray-800"
          >
            <div className="relative h-28 rounded-xl overflow-hidden mb-2">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white shadow-xs">
                {dest.name}
              </span>
            </div>
            <div className="px-1 pb-0.5">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {dest.country}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
