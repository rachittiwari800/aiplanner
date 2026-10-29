import { Router } from 'express';
import { register, login, googleAuth, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authenticateUser, getProfile);
router.patch('/me', authenticateUser, updateProfile);

export default router;
