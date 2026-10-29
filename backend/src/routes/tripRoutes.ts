import { Router } from 'express';
import {
  generateTrip,
  saveTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  emailTrip,
  emailTripDraft,
} from '../controllers/tripController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', authenticateUser, generateTrip);
router.post('/', authenticateUser, saveTrip);
router.post('/email', authenticateUser, emailTripDraft);
router.get('/', authenticateUser, getUserTrips);
router.get('/:id', authenticateUser, getTripById);
router.patch('/:id', authenticateUser, updateTrip);
router.delete('/:id', authenticateUser, deleteTrip);
router.post('/:id/email', authenticateUser, emailTrip);

export default router;

