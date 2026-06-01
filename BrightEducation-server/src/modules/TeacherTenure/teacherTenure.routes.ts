import { Router } from 'express';
import {
  createTeacherTenureHandler,
  getAllTeacherTenuresHandler,
  getTeacherTenureByIdHandler,
  updateTeacherTenureHandler,
  deleteTeacherTenureHandler,
} from './teacherTenure.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/teacher-tenure - Create a new teacher tenure (Admin only)
router.post('/', createTeacherTenureHandler);

// GET /api/v1/teacher-tenure - Get all teacher tenures (optionally filtered by academicYearId, teacherId, status)
router.get('/', getAllTeacherTenuresHandler);

// GET /api/v1/teacher-tenure/:id - Get a specific teacher tenure by ID
router.get('/:id', getTeacherTenureByIdHandler);

// PUT /api/v1/teacher-tenure/:id - Update a teacher tenure (Admin only)
router.put('/:id', updateTeacherTenureHandler);

// DELETE /api/v1/teacher-tenure/:id - Delete a teacher tenure (Admin only)
router.delete('/:id', deleteTeacherTenureHandler);

export default router;
