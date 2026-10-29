import React, { useEffect, useState } from 'react';
import { CloudRain, CloudSun, LoaderCircle, RefreshCw, Search, Sun } from 'lucide-react';
import { Card } from '../ui/Card';
import { usePlannerStore } from '../../store/usePlannerStore';
import { weatherService, type WeatherForecast } from '../../services/weatherService';

const WEATHER_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

const iconForCondition = (condition: string) => {
  const normalized = (condition || '').toLowerCase();
  if (normalized.includes('rain') || normalized.includes('storm')) return CloudRain;
  if (normalized.includes('clear') || normalized.includes('sun')) return Sun;
  return CloudSun;
};

export const WeatherWidget: React.FC = () => {
  const { selectedDestination, formData } = usePlannerStore();
  const defaultCity = selectedDestination?.name || formData.destination || 'Manali';
  const [cityInput, setCityInput] = useState('');
  const [activeCity, setActiveCity] = useState(defaultCity);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [forecastCity, setForecastCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const activeForecast = forecastCity === activeCity ? forecast : null;

  // Update active city if selected destination in store changes
  useEffect(() => {
    const target = selectedDestination?.name || formData.destination;
    if (target && target !== activeCity) {
      setActiveCity(target);
    }
  }, [selectedDestination, formData.destination, activeCity]);

  useEffect(() => {
    if (!activeCity) return;

    let isMounted = true;
    let isFetching = false;
    const lat = selectedDestination?.name === activeCity ? selectedDestination.latitude : undefined;
    const lng = selectedDestination?.name === activeCity ? selectedDestination.longitude : undefined;

    const updateWeather = async () => {
      if (isFetching) return;
      isFetching = true;
      setLoading(true);
      setError('');
      try {
        const data = await weatherService.getForecast(activeCity, lat, lng);
        if (isMounted) {
          setForecast(data);
          setForecastCity(activeCity);
          setLastUpdatedAt(new Date());
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || `Unable to load weather for ${activeCity}`);
        }
      } finally {
        isFetching = false;
        if (isMounted) setLoading(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void updateWeather();
    };

    void updateWeather();
    const intervalId = window.setInterval(() => void updateWeather(), WEATHER_REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeCity, selectedDestination, refreshKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setActiveCity(cityInput.trim());
      setCityInput('');
    }
  };

  const CurrentIcon = activeForecast ? iconForCondition(activeForecast.current.condition) : CloudSun;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Live Weather
          </h3>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            Forecast for {activeForecast?.location || activeCity}
          </p>
          <p className="text-[10px] text-gray-400">
            {loading ? 'Updating...' : activeForecast && lastUpdatedAt ? `Updated ${lastUpdatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          aria-label={`Refresh weather for ${activeCity}`}
          title="Refresh weather"
          disabled={loading}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 disabled:cursor-not-allowed dark:hover:bg-gray-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Quick City Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="Search any destination (e.g. Goa, Paris)..."
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs rounded-xl pl-3 pr-8 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </form>

      {loading && !activeForecast ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500 dark:text-gray-400">
          <LoaderCircle className="h-4 w-4 animate-spin text-purple-600" />
          <span>Fetching weather for {activeCity}...</span>
        </div>
      ) : error && !activeForecast ? (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-700 dark:text-amber-300">
          <p className="font-semibold">Notice</p>
          <p className="mt-0.5">{error}</p>
        </div>
      ) : activeForecast ? (
        <>
          {error ? (
            <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              {error}. Showing the last available reading.
            </p>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-950/60 shadow-xs">
                <CurrentIcon className="h-8 w-8" />
              </div>
              <div>
                <div className="text-3xl font-extrabold leading-none text-gray-900 dark:text-white">
                  {activeForecast.current.temperature}°C
                </div>
                <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {activeForecast.current.condition}
                </p>
                <p className="text-[11px] font-medium text-gray-400">
                  Feels like {activeForecast.current.apparentTemperature}°C
                </p>
              </div>
            </div>

            <div className="space-y-1 text-right text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-400">Humidity</span>
                <span className="font-bold text-gray-900 dark:text-white">{activeForecast.current.humidity}%</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-400">Wind</span>
                <span className="font-bold text-gray-900 dark:text-white">{activeForecast.current.windSpeed} km/h</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-400">Precipitation</span>
                <span className="font-bold text-gray-900 dark:text-white">{activeForecast.current.precipitationProbability}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 border-t border-gray-100 pt-3 text-center dark:border-gray-800">
            {activeForecast.days.map((day) => {
              const DayIcon = iconForCondition(day.condition);
              return (
                <div key={day.date} className="space-y-1 rounded-xl p-1 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <span className="block text-[10px] font-medium text-gray-500 dark:text-gray-400">{day.dayName}</span>
                  <DayIcon className="mx-auto h-4 w-4 text-amber-500" />
                  <span className="block text-[10px] font-bold text-gray-900 dark:text-white">{day.high}°/{day.low}°</span>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </Card>
  );
};
