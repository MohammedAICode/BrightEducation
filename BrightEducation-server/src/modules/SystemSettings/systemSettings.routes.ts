import { Router } from 'express';
import {
  getSystemSettingsHandler,
  updateSystemSettingsHandler,
} from './systemSettings.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/system-settings - Get system settings
router.get('/', getSystemSettingsHandler);

// PATCH /api/v1/system-settings - Update system settings (Admin only)
router.patch('/', updateSystemSettingsHandler);

export default router;
