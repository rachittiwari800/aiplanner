import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Compass, MapPin, Plane, Search, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { destinationService, type DestinationLocation, type DestinationOverview } from '../../services/destinationService';

interface Place {
  name: string;
  category: string;
  location: string;
  description: string;
  photo: string;
  coordinates: string;
}

interface DestinationGuide {
  name: string;
  region: string;
  image: string;
  summary: string;
  places: Place[];
}

interface FlightOption {
  airline: string;
  route: string;
  time: string;
  stops: string;
  price: number;
  badge: string;
}

interface HotelOption {
  name: string;
  area: string;
  rating: number;
  price: number;
  nights: number;
  photo: string;
  features: string[];
}

const guides: DestinationGuide[] = [
  {
    name: 'Manali',
    region: 'Himachal Pradesh, India',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    summary: 'Mountain air, cedar forests, river walks, and a lively old town for a balanced Himalayan escape.',
    places: [
      { name: 'Solang Valley', category: 'Adventure', location: '14 km from Manali', description: 'A wide alpine valley for cable cars, views, and outdoor activities.', photo: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=900&q=80', coordinates: '32.3161° N, 77.1567° E' },
      { name: 'Hadimba Temple', category: 'Culture', location: 'Old Manali', description: 'A cedar forest temple with distinctive timber architecture and quiet trails.', photo: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=900&q=80', coordinates: '32.2432° N, 77.1892° E' },
      { name: 'Old Manali', category: 'Food & culture', location: 'Manali town', description: 'Cafes, craft shops, and slow evenings beside the Beas River.', photo: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80', coordinates: '32.2518° N, 77.1816° E' },
    ],
  },
  {
    name: 'Jaipur',
    region: 'Rajasthan, India',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    summary: 'A vivid city of forts, craft markets, courtyards, and excellent regional food.',
    places: [
      { name: 'Amber Fort', category: 'Heritage', location: 'Amer', description: 'A hilltop fort of mirror halls, courtyards, and sweeping Aravalli views.', photo: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80', coordinates: '26.9855° N, 75.8513° E' },
      { name: 'Hawa Mahal', category: 'Architecture', location: 'Badi Choupad', description: 'The famous honeycomb facade at the heart of Jaipur’s old city.', photo: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80', coordinates: '26.9239° N, 75.8267° E' },
      { name: 'Jal Mahal', category: 'Scenic', location: 'Man Sagar Lake', description: 'A palace floating above the lake, especially atmospheric at sunset.', photo: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80', coordinates: '27.0150° N, 75.8682° E' },
    ],
  },
  {
    name: 'Goa',
    region: 'India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    summary: 'Warm beaches, Portuguese-era streets, seafood, and easygoing coastal days.',
    places: [
      { name: 'Agonda Beach', category: 'Relaxation', location: 'South Goa', description: 'A quieter crescent of sand for swimming, long walks, and sunsets.', photo: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80', coordinates: '15.0468° N, 73.9870° E' },
      { name: 'Fontainhas', category: 'Culture', location: 'Panaji', description: 'A colorful Latin Quarter of balconies, bakeries, and narrow lanes.', photo: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80', coordinates: '15.4939° N, 73.8278° E' },
      { name: 'Dudhsagar Falls', category: 'Nature', location: 'Mollem', description: 'A dramatic waterfall surrounded by forest in the Western Ghats.', photo: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=80', coordinates: '15.3144° N, 74.3140° E' },
    ],
  },
];

const inputClass = 'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/30';
const money = (value: number) => `INR ${value.toLocaleString('en-IN')}`;

const createGuide = (location: DestinationLocation): DestinationGuide => ({
  name: location.name,
  region: [location.region, location.country].filter(Boolean).join(', '),
  image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
  summary: `Build a personalized ${location.name} itinerary around your dates, budget, and interests.`,
  places: [
    { name: `${location.name} old town`, category: 'Culture', location: 'Historic center', description: 'Start here for local architecture, markets, and the character of the destination.', photo: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80', coordinates: `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E` },
    { name: `${location.name} local market`, category: 'Food & culture', location: 'City center', description: 'A practical first stop for regional flavors, crafts, and everyday local life.', photo: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80', coordinates: `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E` },
    { name: `Best views of ${location.name}`, category: 'Scenic', location: location.region || location.country, description: 'Ask the itinerary planner to prioritize a nearby viewpoint or nature escape.', photo: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80', coordinates: `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E` },
  ],
});

const makeFlights = (destination: string, origin: string): FlightOption[] => [
  { airline: 'IndiGo', route: `${origin} → ${destination}`, time: '06:20 – 08:45', stops: 'Non-stop', price: 5400, badge: 'Best value' },
  { airline: 'Air India Express', route: `${origin} → ${destination}`, time: '10:15 – 13:05', stops: 'Non-stop', price: 6900, badge: 'More flexible' },
  { airline: 'Vistara', route: `${origin} → ${destination}`, time: '15:40 – 18:10', stops: 'Non-stop', price: 8400, badge: 'Comfort pick' },
];

const makeHotels = (guide: DestinationGuide, nights: number): HotelOption[] => [
  { name: `${guide.name} Riverside Stay`, area: 'Central district', rating: 4.6, price: 2200, nights, photo: guide.places[2].photo, features: ['Breakfast', 'Free Wi-Fi', 'Flexible cancellation'] },
  { name: `The ${guide.name} Courtyard`, area: 'Old town', rating: 4.8, price: 3900, nights, photo: guide.image, features: ['Pool', 'Breakfast', 'Airport transfer'] },
  { name: `${guide.name} Heritage House`, area: 'Quiet neighborhood', rating: 4.4, price: 3100, nights, photo: guide.places[1].photo, features: ['Local host', 'Rooftop', 'Room service'] },
];

export const DestinationDiscovery: React.FC<{ initialKind: 'flights' | 'hotels' | 'places'; initialLocation?: DestinationLocation | null; onSelectDestination?: (destination: string) => void; onSelectLocation?: (location: DestinationLocation) => void }> = ({ initialKind, initialLocation, onSelectDestination, onSelectLocation }) => {
  const [kind, setKind] = useState(initialKind);
  const [destination, setDestination] = useState(initialLocation?.name ?? '');
  const [origin, setOrigin] = useState('Delhi');
  const [date, setDate] = useState('2026-09-10');
  const [budget, setBudget] = useState(initialKind === 'hotels' ? '4000' : '10000');
  const [nights, setNights] = useState('4');
  const [searched, setSearched] = useState(false);
  const [locations, setLocations] = useState<DestinationLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<DestinationLocation | null>(initialLocation ?? null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState('5');
  const [totalBudget, setTotalBudget] = useState('25000');
  const [overview, setOverview] = useState<DestinationOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setDestination(initialLocation.name);
      setSelectedLocation(initialLocation);
      setSearched(true);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (selectedLocation) onSelectLocation?.(selectedLocation);
  }, [onSelectLocation, selectedLocation]);

  const guide = useMemo(() => {
    if (!selectedLocation) return null;
    return guides.find((item) => item.name.toLowerCase() === selectedLocation.name.toLowerCase()) ?? createGuide(selectedLocation);
  }, [selectedLocation]);
  const flights = useMemo(() => guide ? makeFlights(guide.name, origin) : [], [guide, origin]);
  const hotels = useMemo(() => guide ? makeHotels(guide, Number(nights) || 1) : [], [guide, nights]);
  const affordableFlights = flights.filter((flight) => flight.price <= Number(budget));
  const affordableHotels = hotels.filter((hotel) => hotel.price <= Number(budget));

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    setSearching(true);
    setError('');
    try {
      const response = await destinationService.search(destination);
      setLocations(response.locations);
      setSelectedLocation(response.locations[0] ?? null);
      setSearched(true);
      if (!response.locations.length) setError('No locations found. Try a city, region, or country name.');
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Could not search destinations.');
    } finally {
      setSearching(false);
    }
  };

  const buildOverview = async () => {
    if (!selectedLocation) return;
    setOverviewLoading(true);
    setError('');
    try {
      setOverview(await destinationService.getOverview(selectedLocation, Number(days), Number(totalBudget)));
    } catch (overviewError) {
      setError(overviewError instanceof Error ? overviewError.message : 'Could not load the destination overview.');
    } finally {
      setOverviewLoading(false);
    }
  };

  return <div className="space-y-5">
    {selectedLocation ? <Button type="button" variant="gradient" disabled={overviewLoading} onClick={buildOverview}><Compass className="h-4 w-4" />{overviewLoading ? 'Building overview...' : 'Build full trip overview'}</Button> : null}
    <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
      {(['flights', 'hotels', 'places'] as const).map((view) => <button type="button" key={view} onClick={() => { setKind(view); setSearched(false); }} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold capitalize transition-colors ${kind === view ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
        {view === 'flights' ? <Plane className="h-3.5 w-3.5" /> : view === 'hotels' ? <Building2 className="h-3.5 w-3.5" /> : <Compass className="h-3.5 w-3.5" />}{view}
      </button>)}
    </div>

    <form onSubmit={search} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {kind === 'flights' ? <label className="block space-y-1.5"><span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">From</span><input className={inputClass} value={origin} onChange={(event) => setOrigin(event.target.value)} required /></label> : null}
      <label className="block space-y-1.5"><span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Search any destination</span><input className={inputClass} value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Try Kyoto, Paris, Bali..." required /></label>
      {kind !== 'places' ? <label className="block space-y-1.5"><span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{kind === 'flights' ? 'Departure date' : 'Check-in date'}</span><input className={inputClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label> : null}
      {kind === 'hotels' ? <label className="block space-y-1.5"><span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Nights</span><input className={inputClass} type="number" min="1" value={nights} onChange={(event) => setNights(event.target.value)} /></label> : null}
      <label className="block space-y-1.5"><span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Trip days</span><input className={inputClass} type="number" min="1" max="30" value={days} onChange={(event) => setDays(event.target.value)} required /></label>
      <label className="block space-y-1.5"><span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Total trip budget (INR)</span><input className={inputClass} type="number" min="100" value={totalBudget} onChange={(event) => setTotalBudget(event.target.value)} required /></label>
      {kind !== 'places' ? <label className="block space-y-1.5"><span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{kind === 'flights' ? 'Max fare per traveler' : 'Max nightly budget'}</span><input className={inputClass} type="number" min="1" value={budget} onChange={(event) => setBudget(event.target.value)} required /></label> : null}
      <Button type="submit" variant="gradient" disabled={searching} className="sm:col-span-2 sm:w-fit"><Search className="h-4 w-4" />{searching ? 'Searching...' : 'Search destinations'}</Button>
    </form>

    {error ? <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}
    {locations.length > 1 ? <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Choose a location</p><div className="grid gap-2 sm:grid-cols-2">{locations.map((location) => <button type="button" key={location.id} onClick={() => { setSelectedLocation(location); setDestination(location.name); setSearched(true); }} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors ${selectedLocation?.id === location.id ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30' : 'border-gray-200 dark:border-gray-700'}`}><span><span className="block text-sm font-bold text-gray-900 dark:text-white">{location.name}</span><span className="block text-xs text-gray-500 dark:text-gray-400">{[location.region, location.country].filter(Boolean).join(', ')}</span></span><MapPin className="h-4 w-4 shrink-0 text-purple-500" /></button>)}</div></div> : null}

    {guide ? <Card className="overflow-hidden border-purple-100 bg-purple-50/70 dark:border-purple-900/50 dark:bg-purple-950/20">
      <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
        <img src={guide.image} alt={`${guide.name} destination`} className="h-32 w-full rounded-xl object-cover sm:h-full" />
        <div><p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Selected destination</p><h2 className="mt-1 text-xl font-extrabold text-gray-900 dark:text-white">{guide.name}, {guide.region}</h2><p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{guide.summary}</p><p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400"><MapPin className="h-3.5 w-3.5" />{selectedLocation?.latitude.toFixed(4)}° N, {selectedLocation?.longitude.toFixed(4)}° E</p><Button type="button" variant="gradient" size="sm" className="mt-4" onClick={() => onSelectDestination?.(guide.name)}>Use for itinerary</Button></div>
      </div>
    </Card> : <Card className="p-5"><p className="text-sm font-semibold text-gray-900 dark:text-white">Search a city to begin</p><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your selected location will be used for flights, stays, places, and the AI itinerary.</p></Card>}

    {kind === 'flights' && searched && guide ? <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold text-gray-900 dark:text-white">Flights within {money(Number(budget))}</h3><span className="text-xs text-gray-500 dark:text-gray-400">{date}</span></div>{affordableFlights.length ? affordableFlights.map((flight) => <Card key={flight.airline} className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-gray-900 dark:text-white">{flight.airline}</p><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{flight.route} · {flight.time} · {flight.stops}</p></div><div className="text-right"><p className="font-extrabold text-gray-900 dark:text-white">{money(flight.price)}</p><p className="text-xs text-emerald-600 dark:text-emerald-400">{flight.badge}</p></div></div></Card>) : <p className="text-sm text-gray-500 dark:text-gray-400">No saved options fit this budget. Increase the fare limit to see more.</p>}</div> : null}

    {kind === 'hotels' && searched && guide ? <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold text-gray-900 dark:text-white">Stays within {money(Number(budget))} / night</h3><span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Wallet className="h-3.5 w-3.5" />{nights} nights</span></div>{affordableHotels.length ? affordableHotels.map((hotel) => <Card key={hotel.name} className="overflow-hidden"><div className="grid gap-4 sm:grid-cols-[130px_1fr_auto]"><img src={hotel.photo} alt={hotel.name} className="h-28 w-full object-cover sm:h-full" /><div className="p-4 sm:pl-0"><p className="font-bold text-gray-900 dark:text-white">{hotel.name}</p><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hotel.area} · {hotel.rating} / 5</p><div className="mt-3 flex flex-wrap gap-1.5">{hotel.features.map((feature) => <span key={feature} className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">{feature}</span>)}</div></div><div className="p-4 text-right sm:pl-0"><p className="font-extrabold text-gray-900 dark:text-white">{money(hotel.price)}</p><p className="text-xs text-gray-500 dark:text-gray-400">per night</p><p className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400">{money(hotel.price * hotel.nights)} total</p></div></div></Card>) : <p className="text-sm text-gray-500 dark:text-gray-400">No saved stays fit this nightly budget. Increase the limit to see more.</p>}</div> : null}

    {kind === 'places' && guide ? <div className="space-y-3"><div><h3 className="font-bold text-gray-900 dark:text-white">Places worth visiting in {guide.name}</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Photos, local areas, and coordinates are kept together in your planner.</p></div><div className="grid gap-4 md:grid-cols-3">{guide.places.map((place) => <Card key={place.name} className="overflow-hidden"><img src={place.photo} alt={place.name} className="h-36 w-full object-cover" /><div className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{place.category}</p><h4 className="mt-1 font-bold text-gray-900 dark:text-white">{place.name}</h4><p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><MapPin className="h-3.5 w-3.5" />{place.location}</p><p className="mt-3 text-sm leading-5 text-gray-600 dark:text-gray-300">{place.description}</p><p className="mt-3 border-t border-gray-100 pt-3 text-[11px] font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">{place.coordinates}</p></div></Card>)}</div></div> : null}
    {overview ? <div className="space-y-4 border-t border-gray-200 pt-5 dark:border-gray-700"><div><p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">One-click trip overview</p><h3 className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">{overview.destination} for {overview.days} days</h3></div><Card className="p-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{Object.entries(overview.budgetAllocation).map(([category, value]) => <div key={category} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/70"><p className="text-xs capitalize text-gray-500 dark:text-gray-400">{category}</p><p className="mt-1 text-sm font-extrabold text-gray-900 dark:text-white">{money(value)}</p></div>)}</div></Card><div><h3 className="font-bold text-gray-900 dark:text-white">Landmarks arranged across your days</h3><div className="mt-3 grid gap-4 md:grid-cols-3">{overview.landmarks.map((landmark, index) => <Card key={landmark.id} className="overflow-hidden"><img src={landmark.imageUrl || guide?.image} alt={landmark.name} className="h-36 w-full object-cover" /><div className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Day {(index % overview.days) + 1}</p><h4 className="mt-1 font-bold text-gray-900 dark:text-white">{landmark.name}</h4><p className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300">{landmark.description}</p><p className="mt-3 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400"><MapPin className="h-3.5 w-3.5" />{landmark.latitude.toFixed(4)}° N, {landmark.longitude.toFixed(4)}° E · {Math.round(landmark.distanceMeters / 1000)} km away</p></div></Card>)}</div></div><div><h3 className="font-bold text-gray-900 dark:text-white">Flights and stays in the same overview</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{flights.slice(0, 2).map((flight) => <Card key={flight.airline} className="p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-bold text-gray-900 dark:text-white">{flight.airline}</p><p className="text-xs text-gray-500 dark:text-gray-400">{flight.route} · {flight.stops}</p></div><p className="font-extrabold text-gray-900 dark:text-white">{money(flight.price)}</p></div></Card>)}{hotels.slice(0, 2).map((hotel) => <Card key={hotel.name} className="p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-bold text-gray-900 dark:text-white">{hotel.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{hotel.area} · {hotel.rating} / 5</p></div><p className="font-extrabold text-gray-900 dark:text-white">{money(hotel.price)}<span className="block text-[11px] font-normal text-gray-500 dark:text-gray-400">per night</span></p></div></Card>)}</div></div></div> : null}
  </div>;
};
