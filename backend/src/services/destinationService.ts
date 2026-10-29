export interface DestinationSearchResult {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    country: string;
    country_code?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    city?: string;
    town?: string;
    county?: string;
  };
}

export interface LandmarkSearchResult {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  imageUrl?: string;
  sourceUrl: string;
}

interface WikimediaGeoResponse {
  query?: {
    geosearch?: Array<{
      pageid: number;
      title: string;
      lat: number;
      lon: number;
      dist: number;
    }>;
  };
}

interface WikimediaSummary {
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source?: string };
}

export async function searchDestinations(query: string): Promise<DestinationSearchResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '8');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Destination search is temporarily unavailable');
  }

  const data = await response.json() as GeocodingResponse;
  const results = (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country,
    countryCode: result.country_code,
    region: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }));

  if (results.length) return results;

  const fallbackUrl = new URL('https://nominatim.openstreetmap.org/search');
  fallbackUrl.searchParams.set('q', query);
  fallbackUrl.searchParams.set('format', 'jsonv2');
  fallbackUrl.searchParams.set('addressdetails', '1');
  fallbackUrl.searchParams.set('limit', '8');

  const fallbackResponse = await fetch(fallbackUrl, {
    headers: { 'User-Agent': 'Wayfarer-AI-Travel-Planner/1.0' },
  });
  if (!fallbackResponse.ok) return [];

  const fallbackResults = await fallbackResponse.json() as NominatimResult[];
  return fallbackResults.map((result) => ({
    id: result.place_id,
    name: result.address?.city || result.address?.town || result.address?.state || result.display_name.split(',')[0],
    country: result.address?.country || 'Unknown country',
    countryCode: result.address?.country_code?.toUpperCase(),
    region: result.address?.state || result.address?.county,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  }));
}

export async function searchLandmarks(latitude: number, longitude: number): Promise<LandmarkSearchResult[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'geosearch');
  url.searchParams.set('gscoord', `${latitude}|${longitude}`);
  url.searchParams.set('gsradius', '10000');
  url.searchParams.set('gslimit', '8');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const response = await fetch(url);
  if (!response.ok) throw new Error('Landmark search is temporarily unavailable');

  const data = await response.json() as WikimediaGeoResponse;
  const landmarks = await Promise.all((data.query?.geosearch ?? []).map(async (landmark) => {
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(landmark.title.replace(/ /g, '_'))}`;
    const summaryResponse = await fetch(summaryUrl);
    const summary = summaryResponse.ok ? await summaryResponse.json() as WikimediaSummary : {};
    return {
      id: landmark.pageid,
      name: landmark.title,
      description: summary.extract || 'A notable place to explore in this destination.',
      latitude: landmark.lat,
      longitude: landmark.lon,
      distanceMeters: Math.round(landmark.dist),
      imageUrl: summary.thumbnail?.source,
      sourceUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(landmark.title.replace(/ /g, '_'))}`,
    };
  }));

  return landmarks;
}
