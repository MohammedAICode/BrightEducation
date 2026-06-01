import { Router } from 'express';
import {
  createClassSubjectHandler,
  getAllClassSubjectsHandler,
  getClassSubjectByIdHandler,
  updateClassSubjectHandler,
  deleteClassSubjectHandler,
} from './classSubject.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/class-subject - Create a new class subject (Admin only)
router.post('/', createClassSubjectHandler);

// GET /api/v1/class-subject - Get all class subjects (optionally filtered by classTenureId)
router.get('/', getAllClassSubjectsHandler);

// GET /api/v1/class-subject/:id - Get a specific class subject by ID
router.get('/:id', getClassSubjectByIdHandler);

// PUT /api/v1/class-subject/:id - Update a class subject (Admin only)
router.put('/:id', updateClassSubjectHandler);

// DELETE /api/v1/class-subject/:id - Delete a class subject (Admin only)
router.delete('/:id', deleteClassSubjectHandler);

export default router;
