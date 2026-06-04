import { Router } from 'express';
import {
  createStudentFeeController,
  getStudentFeesController,
  getStudentFeeByIdController,
  updateStudentFeeController,
  recordPaymentController,
  getFeePaymentsController,
  getFeesByAcademicYearController,
} from './studentFee.controller';
import { authenticate } from '../../config/middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/student-fee - Create a student fee record
router.post('/', createStudentFeeController);

// GET /api/v1/student-fee/student/:studentId - Get fees for a student
router.get('/student/:studentId', getStudentFeesController);

// GET /api/v1/student-fee/:id - Get a specific fee record
router.get('/:id', getStudentFeeByIdController);

// PATCH /api/v1/student-fee/:id - Update a fee record
router.patch('/:id', updateStudentFeeController);

// POST /api/v1/student-fee/payment - Record a payment
router.post('/payment', recordPaymentController);

// GET /api/v1/student-fee/:studentFeeId/payments - Get payments for a fee
router.get('/:studentFeeId/payments', getFeePaymentsController);

// GET /api/v1/student-fee/academic-year/:academicYearId - Get fees for an academic year
router.get('/academic-year/:academicYearId', getFeesByAcademicYearController);

export default router;
