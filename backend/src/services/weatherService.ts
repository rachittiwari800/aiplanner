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

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation_probability: number;
    weather_code: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

const conditionForCode = (code: number) => {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  return 'Thunderstorms';
};

export async function getWeatherForecast(location: string, latitude: number, longitude: number): Promise<WeatherForecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code');
  url.searchParams.set('forecast_days', '5');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url);
  if (!response.ok) throw new Error('Weather service is temporarily unavailable');
  const data = await response.json() as OpenMeteoResponse;
  if (!data.current || !data.daily) throw new Error('Weather data is unavailable for this location');

  return {
    location,
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      precipitationProbability: data.current.precipitation_probability,
      condition: conditionForCode(data.current.weather_code),
    },
    days: data.daily.time.map((date, index) => ({
      date,
      dayName: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      high: Math.round(data.daily?.temperature_2m_max[index] ?? 0),
      low: Math.round(data.daily?.temperature_2m_min[index] ?? 0),
      precipitationProbability: data.daily?.precipitation_probability_max[index] ?? 0,
      condition: conditionForCode(data.daily?.weather_code[index] ?? 0),
    })),
  };
}
