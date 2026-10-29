import api from './api';

export interface DestinationLocation {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface Landmark {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  imageUrl?: string;
  sourceUrl: string;
}

export interface DestinationOverview {
  destination: string;
  days: number;
  budget: number;
  landmarks: Landmark[];
  budgetAllocation: {
    flights: number;
    hotels: number;
    food: number;
    landmarks: number;
    other: number;
  };
}

export const destinationService = {
  async search(query: string): Promise<{ locations: DestinationLocation[] }> {
    const response = await api.get('/destinations/search', { params: { q: query } });
    return response.data.data;
  },
  async getOverview(location: DestinationLocation, days: number, budget: number): Promise<DestinationOverview> {
    const response = await api.get('/destinations/overview', {
      params: { name: location.name, latitude: location.latitude, longitude: location.longitude, days, budget },
    });
    return response.data.data;
  },
};
