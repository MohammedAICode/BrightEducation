import { Router } from 'express';
import {
  createClassTenureHandler,
  getAllClassTenuresHandler,
  getClassTenureByIdHandler,
  updateClassTenureHandler,
  deleteClassTenureHandler,
} from './classTenure.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/class-tenure - Create a new class tenure (Admin only)
router.post('/', createClassTenureHandler);

// GET /api/v1/class-tenure - Get all class tenures (optionally filtered by academicYearId)
router.get('/', getAllClassTenuresHandler);

// GET /api/v1/class-tenure/:id - Get a specific class tenure by ID
router.get('/:id', getClassTenureByIdHandler);

// PUT /api/v1/class-tenure/:id - Update a class tenure (Admin only)
router.put('/:id', updateClassTenureHandler);

// DELETE /api/v1/class-tenure/:id - Delete a class tenure (Admin only)
router.delete('/:id', deleteClassTenureHandler);

export default router;
