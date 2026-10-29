import api from './api';
import type { Trip } from '../types';

export interface GenerateTripPayload {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelersCount: number;
  travelStyle: string;
  budgetAmount: number;
  currency: string;
  interests?: string[];
}

export const tripService = {
  async generateTrip(payload: GenerateTripPayload): Promise<{ success: boolean; data: Trip }> {
    const response = await api.post('/trips/generate', payload);
    return response.data;
  },

  async saveTrip(trip: Partial<Trip>): Promise<{ success: boolean; data: { trip: Trip } }> {
    const response = await api.post('/trips', trip);
    return response.data;
  },

  async getUserTrips(): Promise<{ success: boolean; data: { trips: Trip[] } }> {
    const response = await api.get('/trips');
    return response.data;
  },

  async getTripById(id: string): Promise<{ success: boolean; data: { trip: Trip } }> {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  async updateTrip(id: string, updates: Partial<Trip>): Promise<{ success: boolean; data: { trip: Trip } }> {
    const response = await api.patch(`/trips/${id}`, updates);
    return response.data;
  },

  async deleteTrip(id: string): Promise<{ success: boolean; data: { id: string } }> {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  async emailTrip(id: string, recipientEmail?: string): Promise<{ success: boolean; message: string; data?: { previewUrl?: string } }> {
    const response = await api.post(`/trips/${id}/email`, { recipientEmail });
    return response.data;
  },

  async emailTripDraft(trip: Partial<Trip>, recipientEmail?: string): Promise<{ success: boolean; message: string; data?: { previewUrl?: string } }> {
    const response = await api.post('/trips/email', { trip, recipientEmail });
    return response.data;
  },
};
