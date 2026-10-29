import { Router } from 'express';
import { getDestinationOverview, searchDestinations } from '../controllers/destinationController.js';

const router = Router();

router.get('/search', searchDestinations);
router.get('/overview', getDestinationOverview);

export default router;
