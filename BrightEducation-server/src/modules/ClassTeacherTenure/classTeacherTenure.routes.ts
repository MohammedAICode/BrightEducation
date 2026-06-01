import { Router } from 'express';
import {
  createClassTeacherTenureHandler,
  getAllClassTeacherTenuresHandler,
  getClassTeacherTenureByIdHandler,
  updateClassTeacherTenureHandler,
  deleteClassTeacherTenureHandler,
} from './classTeacherTenure.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/class-teacher-tenure - Create a new class teacher tenure (Admin only)
router.post('/', createClassTeacherTenureHandler);

// GET /api/v1/class-teacher-tenure - Get all class teacher tenures (optionally filtered by academicYearId, sectionTenureId, teacherId, status)
router.get('/', getAllClassTeacherTenuresHandler);

// GET /api/v1/class-teacher-tenure/:id - Get a specific class teacher tenure by ID
router.get('/:id', getClassTeacherTenureByIdHandler);

// PUT /api/v1/class-teacher-tenure/:id - Update a class teacher tenure (Admin only)
router.put('/:id', updateClassTeacherTenureHandler);

// DELETE /api/v1/class-teacher-tenure/:id - Delete a class teacher tenure (Admin only)
router.delete('/:id', deleteClassTeacherTenureHandler);

export default router;
