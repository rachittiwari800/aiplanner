import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useUIStore } from '../../store/useUIStore';
import { tripService } from '../../services/tripService';
import type { Trip } from '../../types';

const fallbackImage = 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=500';

export const UpcomingTripsGrid: React.FC = () => {
  const { setActiveTab } = useUIStore();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    tripService
      .getUserTrips()
      .then((response) => setTrips(response.data.trips.slice(0, 3)))
      .catch(() => setTrips([]));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Trips</h2>
        <button
          type="button"
          onClick={() => setActiveTab('trips')}
          className="cursor-pointer text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trips.length ? trips.map((trip) => (
          <Card
            key={trip.id}
            onClick={() => setActiveTab('trips')}
            className="group cursor-pointer overflow-hidden p-3"
          >
            <div className="relative mb-3 h-36 overflow-hidden rounded-xl">
              <img
                src={trip.coverImage || fallbackImage}
                alt={trip.destination}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1 px-1">
              <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">{trip.destination}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </p>
              <div className="pt-2">
                <Badge variant="purple">{trip.durationDays} Days</Badge>
              </div>
            </div>
          </Card>
        )) : (
          <Card className="p-5 sm:col-span-2 lg:col-span-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">No saved trips yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Generate and save an itinerary to see it here.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
