import { Request, Response } from 'express';
import { z } from 'zod';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { searchDestinations as findDestinations, searchLandmarks } from '../services/destinationService.js';

const searchSchema = z.object({
  q: z.string().trim().min(2, 'Search at least 2 characters'),
});

const overviewSchema = z.object({
  name: z.string().trim().min(2, 'Destination name is required'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  days: z.coerce.number().int().min(1).max(30).default(5),
  budget: z.coerce.number().min(100).default(25000),
});

export const searchDestinations = async (req: Request, res: Response) => {
  const parseResult = searchSchema.safeParse(req.query);
  if (!parseResult.success) {
    return sendError(res, parseResult.error.errors[0].message, 400);
  }

  try {
    const locations = await findDestinations(parseResult.data.q);
    return sendSuccess(res, { locations }, 'Destinations found');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to search destinations', 502);
  }
};

export const getDestinationOverview = async (req: Request, res: Response) => {
  const parseResult = overviewSchema.safeParse(req.query);
  if (!parseResult.success) {
    return sendError(res, parseResult.error.errors[0].message, 400);
  }

  try {
    const { name, latitude, longitude, days, budget } = parseResult.data;
    const landmarks = await searchLandmarks(latitude, longitude);
    const budgetAllocation = {
      flights: Math.round(budget * 0.3),
      hotels: Math.round(budget * 0.35),
      food: Math.round(budget * 0.15),
      landmarks: Math.round(budget * 0.1),
      other: budget - Math.round(budget * 0.9),
    };

    return sendSuccess(res, {
      destination: name,
      days,
      budget,
      landmarks,
      budgetAllocation,
    }, 'Destination overview ready');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to build destination overview', 502);
  }
};
