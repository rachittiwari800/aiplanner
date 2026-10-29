export type TravelStyle = 'Luxury' | 'Budget' | 'Balanced' | 'Adventure' | 'Relaxation' | 'Culture' | 'Family';

export type ActivityCategory = 'Sightseeing' | 'Food & Drink' | 'Adventure' | 'Shopping' | 'Culture' | 'Relaxation' | 'Travel';

export interface Activity {
  id: string;
  time?: string;
  title: string;
  description: string;
  location?: string;
  estimatedCost?: number;
  currency?: string;
  category: ActivityCategory;
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating?: number;
}

export interface DayPlan {
  dayNumber: number;
  date?: string;
  title: string;
  activities: Activity[];
}

export interface TripBudget {
  totalEstimated: number;
  currency: string;
  categories: {
    flights: number;
    hotels: number;
    food: number;
    activities: number;
    other: number;
  };
}

export interface PackingItem {
  id: string;
  item: string;
  category: string;
  packed: boolean;
}

export interface WeatherDay {
  date: string;
  dayName: string;
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: string;
  chanceOfRain: number;
}

export interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelersCount: number;
  travelStyle: TravelStyle;
  budget: TripBudget;
  coverImage: string;
  itinerary: DayPlan[];
  packingList: PackingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isPremium?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}
