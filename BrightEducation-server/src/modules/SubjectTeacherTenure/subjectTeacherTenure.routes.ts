import { Router } from 'express';
import {
  createSubjectTeacherTenureHandler,
  getAllSubjectTeacherTenuresHandler,
  getSubjectTeacherTenureByIdHandler,
  updateSubjectTeacherTenureHandler,
  deleteSubjectTeacherTenureHandler,
} from './subjectTeacherTenure.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/subject-teacher-tenure - Create a new subject teacher tenure (Admin only)
router.post('/', createSubjectTeacherTenureHandler);

// GET /api/v1/subject-teacher-tenure - Get all subject teacher tenures (optionally filtered by academicYearId, sectionTenureId, classSubjectId, teacherId, status)
router.get('/', getAllSubjectTeacherTenuresHandler);

// GET /api/v1/subject-teacher-tenure/:id - Get a specific subject teacher tenure by ID
router.get('/:id', getSubjectTeacherTenureByIdHandler);

// PUT /api/v1/subject-teacher-tenure/:id - Update a subject teacher tenure (Admin only)
router.put('/:id', updateSubjectTeacherTenureHandler);

// DELETE /api/v1/subject-teacher-tenure/:id - Delete a subject teacher tenure (Admin only)
router.delete('/:id', deleteSubjectTeacherTenureHandler);

export default router;
