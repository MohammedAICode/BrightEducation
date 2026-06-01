import { Router } from 'express';
import {
  createStudentEnrollmentHandler,
  getAllStudentEnrollmentsHandler,
  getStudentEnrollmentByIdHandler,
  updateStudentEnrollmentHandler,
  deleteStudentEnrollmentHandler,
} from './studentEnrollment.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/student-enrollment - Create a new student enrollment (Admin only)
router.post('/', createStudentEnrollmentHandler);

// GET /api/v1/student-enrollment - Get all student enrollments (optionally filtered by academicYearId, sectionTenureId, status)
router.get('/', getAllStudentEnrollmentsHandler);

// GET /api/v1/student-enrollment/:id - Get a specific student enrollment by ID
router.get('/:id', getStudentEnrollmentByIdHandler);

// PUT /api/v1/student-enrollment/:id - Update a student enrollment (Admin only)
router.put('/:id', updateStudentEnrollmentHandler);

// PATCH /api/v1/student-enrollment/:id - Partially update a student enrollment (Admin only)
router.patch('/:id', updateStudentEnrollmentHandler);

// DELETE /api/v1/student-enrollment/:id - Delete a student enrollment (Admin only)
router.delete('/:id', deleteStudentEnrollmentHandler);

export default router;
