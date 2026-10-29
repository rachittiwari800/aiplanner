import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,72}$/;
const emailSchema = z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase());

const registerSchema = z.object({
  name: z.string().trim().regex(nameRegex, 'Name may contain only letters, spaces, apostrophes, and hyphens'),
  email: emailSchema,
  password: z.string().regex(passwordRegex, 'Password must be 8-72 characters with uppercase, lowercase, number, and special character'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  credential: z.string().optional(),
  googleId: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
});

const publicUser = (user: { id: string; name: string; email: string; avatarUrl: string | null; isPremium: boolean }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  isPremium: user.isPremium,
});

const findUserByEmail = async (email: string) => {
  const normalized = email.toLowerCase();
  const exact = await prisma.user.findUnique({ where: { email: normalized } });
  if (exact) return exact;
  if (email !== normalized) {
    return prisma.user.findUnique({ where: { email } });
  }
  return null;
};

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.errors[0].message, 400);
    const { name, email, password } = parsed.data;
    const existingUser = await findUserByEmail(email);
    if (existingUser) return sendError(res, 'User with this email already exists', 400);

    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash: await hashPassword(password), avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}` },
    });
    const token = signToken({ userId: user.id, email: user.email });
    return sendSuccess(res, { token, user: publicUser(user) }, 'User registered successfully', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.errors[0].message, 400);
    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);
    if (!user) return sendError(res, 'Invalid credentials', 401);
    if (!user.passwordHash) {
      return sendError(res, 'This account has no password yet. Register with email and password, or use Google sign-in.', 401);
    }
    if (!(await comparePassword(password, user.passwordHash))) {
      return sendError(res, 'Invalid credentials', 401);
    }
    return sendSuccess(res, { token: signToken({ userId: user.id, email: user.email }), user: publicUser(user) }, 'Logged in successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', 500);
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const parsed = googleAuthSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.errors[0].message, 400);

    let googleId = parsed.data.googleId;
    let email = parsed.data.email;
    let name = parsed.data.name;
    let avatarUrl = parsed.data.avatarUrl;

    if (parsed.data.credential) {
      try {
        const parts = parsed.data.credential.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.sub) googleId = payload.sub;
          if (payload.email) email = payload.email.toLowerCase();
          if (payload.name) name = payload.name;
          if (payload.picture) avatarUrl = payload.picture;
        }
      } catch (e) {
        return sendError(res, 'Invalid Google credential format', 400);
      }
    }

    if (!email || !name) {
      return sendError(res, 'Google email and name are required', 400);
    }

    const normalizedEmail = email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          googleId: googleId || `google_${Date.now()}`,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        },
      });
    } else {
      const updates: any = {};
      if (!user.googleId && googleId) updates.googleId = googleId;
      if (!user.avatarUrl && avatarUrl) updates.avatarUrl = avatarUrl;
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({ where: { id: user.id }, data: updates });
      }
    }

    return sendSuccess(
      res,
      { token: signToken({ userId: user.id, email: user.email }), user: publicUser(user) },
      'Google authentication successful'
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Google Auth failed', 500);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, avatarUrl: true, isPremium: true } });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user }, 'Profile retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch profile', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return sendError(res, 'Unauthorized', 401);
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, parsed.error.errors[0].message, 400);
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: { name: parsed.data.name }, select: { id: true, name: true, email: true, avatarUrl: true, isPremium: true } });
    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update profile', 500);
  }
};
