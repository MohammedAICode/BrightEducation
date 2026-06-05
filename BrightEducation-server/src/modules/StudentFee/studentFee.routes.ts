import { Router } from 'express';

import {

  createStudentFeeController,

  getStudentFeesController,

  getStudentFeeByIdController,

  updateStudentFeeController,

  recordPaymentController,

  getFeePaymentsController,

  getFeesByAcademicYearController,

  calculateTuitionFeeTotalController,

  calculateSchoolFeeTotalController,

  deleteFeePaymentController,

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

// GET /api/v1/student-fee/:studentFeeId/calculate - Calculate tuition fee total dynamically
router.get('/:studentFeeId/calculate', calculateTuitionFeeTotalController);

// GET /api/v1/student-fee/:studentFeeId/calculate-school - Calculate school fee total dynamically
router.get('/:studentFeeId/calculate-school', calculateSchoolFeeTotalController);

// DELETE /api/v1/student-fee/payment/:studentFeeId - Delete a payment
router.delete('/payment/:studentFeeId', deleteFeePaymentController);


export default router;

