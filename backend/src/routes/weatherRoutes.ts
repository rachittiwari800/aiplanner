import { Router } from 'express';
import { getWeather } from '../controllers/weatherController.js';

const router = Router();

router.get('/forecast', getWeather);

export default router;
