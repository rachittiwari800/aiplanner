import { Router } from 'express';
import { getVisaInfo } from '../controllers/visaController.js';

const router = Router();

router.get('/:country', getVisaInfo);

export default router;

