import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { generateItineraryAI } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sendItineraryEmail } from '../services/emailService.js';

const generateSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  travelersCount: z.number().min(1).default(1),
  travelStyle: z.string().default('Balanced'),
  budgetAmount: z.number().min(100),
  currency: z.string().default('USD'),
  interests: z.array(z.string()).optional(),
});

const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());
const activitySchema = z.object({
  id: z.string().optional(),
  time: z.string().optional(),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
  estimatedCost: z.number().optional(),
  currency: z.string().optional(),
  category: z.string(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  rating: z.number().optional(),
});
const saveTripSchema = z.object({
  destination: z.string().trim().min(2, 'Destination is required'),
  country: z.string().trim().min(2).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  durationDays: z.number().int().min(1).max(365),
  travelersCount: z.number().int().min(1).max(100),
  travelStyle: z.string().trim().min(1),
  coverImage: z.string().optional().nullable(),
  budget: z.object({
    totalEstimated: z.number().nonnegative(),
    currency: z.string().trim().min(1).max(10),
    categories: z.object({
      flights: z.number().nonnegative(),
      hotels: z.number().nonnegative(),
      food: z.number().nonnegative(),
      activities: z.number().nonnegative(),
      other: z.number().nonnegative(),
    }),
  }),
  itinerary: z.array(z.object({
    dayNumber: z.number().int(),
    date: z.string().optional(),
    title: z.string(),
    activities: z.array(activitySchema),
  })),
  packingList: z.array(z.object({
    id: z.string(),
    item: z.string(),
    category: z.string(),
    packed: z.boolean(),
  })),
});

const updateTripSchema = z.object({
  packingList: z.array(z.object({
    id: z.string(),
    item: z.string(),
    category: z.string(),
    packed: z.boolean(),
  })).optional(),
  budget: z.object({
    totalEstimated: z.number().nonnegative(),
    currency: z.string().trim().min(1).max(10),
    categories: z.object({
      flights: z.number().nonnegative(),
      hotels: z.number().nonnegative(),
      food: z.number().nonnegative(),
      activities: z.number().nonnegative(),
      other: z.number().nonnegative(),
    }),
  }).optional(),
  itinerary: z.array(z.object({
    dayNumber: z.number().int(),
    date: z.string().optional(),
    title: z.string(),
    activities: z.array(activitySchema),
  })).optional(),
});

export const generateTrip = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.userId) return sendError(res, 'Unauthorized', 401);
  try {
    const parseResult = generateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400);
    }

    const itineraryData = await generateItineraryAI(parseResult.data);
    return sendSuccess(res, itineraryData, 'AI Itinerary generated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate itinerary', 500);
  }
};

export const saveTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const parsed = saveTripSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.errors[0].message, 400);
    const { destination, country, startDate, endDate, durationDays, travelersCount, travelStyle, coverImage, budget, itinerary, packingList } = parsed.data;
    if (new Date(endDate) <= new Date(startDate)) return sendError(res, 'End date must be after start date', 400);

    const trip = await prisma.trip.create({
      data: {
        userId,
        destination,
        country: country || destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        durationDays: durationDays || 5,
        travelersCount: travelersCount || 1,
        travelStyle: travelStyle || 'Balanced',
        coverImage,
        budget,
        itinerary,
        packingList,
      },
    });

    return sendSuccess(res, { trip }, 'Trip saved successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to save trip', 500);
  }
};

export const getUserTrips = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, { trips }, 'User trips fetched successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch trips', 500);
  }
};

export const getTripById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const tripId = Array.isArray(id) ? id[0] : id;
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }

    return sendSuccess(res, { trip }, 'Trip details retrieved');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch trip details', 500);
  }
};

export const updateTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const tripId = Array.isArray(id) ? id[0] : id;

    const parsed = updateTripSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.errors[0].message, 400);

    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });
    if (!existingTrip) return sendError(res, 'Trip not found', 404);

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(parsed.data.packingList ? { packingList: parsed.data.packingList } : {}),
        ...(parsed.data.budget ? { budget: parsed.data.budget } : {}),
        ...(parsed.data.itinerary ? { itinerary: parsed.data.itinerary } : {}),
      },
    });

    return sendSuccess(res, { trip: updated }, 'Trip updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update trip', 500);
  }
};

export const deleteTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const tripId = Array.isArray(id) ? id[0] : id;

    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    });
    if (!existingTrip) return sendError(res, 'Trip not found', 404);

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return sendSuccess(res, { id: tripId }, 'Trip deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete trip', 500);
  }
};

export const emailTrip = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const tripId = Array.isArray(id) ? id[0] : id;
    const recipientEmail = (req.body.recipientEmail as string) || userEmail;

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return sendError(res, 'Valid recipient email address is required', 400);
    }

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: { user: true },
    });

    if (!trip) return sendError(res, 'Trip not found', 404);

    const emailResult = await sendItineraryEmail({
      recipientEmail,
      recipientName: trip.user?.name || req.body.recipientName || 'Traveler',
      trip,
    });

    return sendSuccess(
      res,
      {
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl,
        sentTo: recipientEmail,
      },
      `Itinerary for ${trip.destination} has been sent to ${recipientEmail}`
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to email itinerary', 500);
  }
};

export const emailTripDraft = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const recipientEmail = (req.body.recipientEmail as string) || userEmail;

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return sendError(res, 'Valid recipient email address is required', 400);
    }

    const trip = req.body.trip || req.body;
    if (!trip || !trip.destination || !trip.itinerary) {
      return sendError(res, 'Invalid trip data for email', 400);
    }

    const emailResult = await sendItineraryEmail({
      recipientEmail,
      recipientName: req.body.recipientName || 'Traveler',
      trip: {
        destination: trip.destination,
        country: trip.country,
        startDate: trip.startDate || new Date(),
        endDate: trip.endDate || new Date(),
        durationDays: trip.durationDays || trip.itinerary?.length || 5,
        travelersCount: trip.travelersCount || 1,
        travelStyle: trip.travelStyle || 'Balanced',
        coverImage: trip.coverImage,
        budget: trip.budget || {
          totalEstimated: 25000,
          currency: 'INR',
          categories: { flights: 0, hotels: 0, food: 0, activities: 0, other: 0 },
        },
        itinerary: trip.itinerary || [],
        packingList: trip.packingList || [],
      },
    });

    return sendSuccess(
      res,
      {
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl,
        sentTo: recipientEmail,
      },
      `Itinerary for ${trip.destination} has been sent to ${recipientEmail}`
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to email itinerary', 500);
  }
};


