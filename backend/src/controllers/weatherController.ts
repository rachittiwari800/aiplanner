import { Request, Response } from 'express';
import { z } from 'zod';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { getWeatherForecast } from '../services/weatherService.js';
import { searchDestinations } from '../services/destinationService.js';

const weatherSchema = z.object({
  location: z.string().trim().min(2, 'Location is required'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const getWeather = async (req: Request, res: Response) => {
  const parsed = weatherSchema.safeParse(req.query);
  if (!parsed.success) return sendError(res, parsed.error.errors[0].message, 400);

  try {
    let lat = parsed.data.latitude;
    let lng = parsed.data.longitude;
    let locName = parsed.data.location;

    if (lat === undefined || lng === undefined) {
      const locations = await searchDestinations(locName);
      if (!locations || locations.length === 0) {
        return sendError(res, `Could not find coordinates for "${locName}". Try specifying a nearby major city.`, 404);
      }
      lat = locations[0].latitude;
      lng = locations[0].longitude;
      locName = locations[0].name;
    }

    const weather = await getWeatherForecast(locName, lat, lng);
    return sendSuccess(res, weather, 'Weather forecast loaded');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to load weather', 502);
  }
};
