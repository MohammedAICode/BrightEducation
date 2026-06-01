import { Router } from 'express';
import {
  createStaffTenureHandler,
  getAllStaffTenuresHandler,
  getStaffTenureByIdHandler,
  updateStaffTenureHandler,
  deleteStaffTenureHandler,
} from './staffTenure.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/staff-tenure - Create a new staff tenure (Admin only)
router.post('/', createStaffTenureHandler);

// GET /api/v1/staff-tenure - Get all staff tenures (optionally filtered by academicYearId, staffId, status)
router.get('/', getAllStaffTenuresHandler);

// GET /api/v1/staff-tenure/:id - Get a specific staff tenure by ID
router.get('/:id', getStaffTenureByIdHandler);

// PUT /api/v1/staff-tenure/:id - Update a staff tenure (Admin only)
router.put('/:id', updateStaffTenureHandler);

// DELETE /api/v1/staff-tenure/:id - Delete a staff tenure (Admin only)
router.delete('/:id', deleteStaffTenureHandler);

export default router;
