import api from './api';

export interface WeatherForecast {
  location: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    precipitationProbability: number;
    condition: string;
  };
  days: Array<{
    date: string;
    dayName: string;
    high: number;
    low: number;
    precipitationProbability: number;
    condition: string;
  }>;
}

export const weatherService = {
  async getForecast(location: string, latitude?: number, longitude?: number): Promise<WeatherForecast> {
    const params: Record<string, any> = { location };
    if (latitude !== undefined && longitude !== undefined) {
      params.latitude = latitude;
      params.longitude = longitude;
    }
    const response = await api.get('/weather/forecast', { params });
    return response.data.data;
  },
};
