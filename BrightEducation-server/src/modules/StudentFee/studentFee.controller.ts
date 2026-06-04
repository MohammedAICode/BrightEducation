import { Request, Response } from 'express';
import logger from '../../libs/logger';
import {
  createStudentFee,
  getStudentFees,
  getStudentFeeById,
  updateStudentFee,
  recordPayment,
  getFeePayments,
  getFeesByAcademicYear,
} from './studentFee.service';

export async function createStudentFeeController(req: Request, res: Response) {
  try {
    const { studentId, academicYearId, feeType, monthlyAmount, totalAmount, annualFee, examFee, miscellaneousFee, labFee, includeInMonthlyCalculation, discountPercentage } = req.body;

    logger.info(`[CONTROLLER] Creating student fee for student: ${studentId}`);

    const studentFee = await createStudentFee({
      studentId,
      academicYearId,
      feeType,
      monthlyAmount,
      totalAmount,
      annualFee,
      examFee,
      miscellaneousFee,
      labFee,
      includeInMonthlyCalculation,
      discountPercentage,
    });

    return res.status(201).json({
      error: false,
      body: studentFee,
      message: 'Student fee created successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to create student fee: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to create student fee',
    });
  }
}

export async function getStudentFeesController(req: Request, res: Response) {
  try {
    const { studentId } = req.params;
    const studentIdStr = Array.isArray(studentId) ? studentId[0] : studentId;

    logger.info(`[CONTROLLER] Fetching fees for student: ${studentIdStr}`);

    const fees = await getStudentFees(studentIdStr);

    return res.status(200).json({
      error: false,
      body: fees,
      message: 'Student fees fetched successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to fetch student fees: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to fetch student fees',
    });
  }
}

export async function getStudentFeeByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    logger.info(`[CONTROLLER] Fetching fee record: ${idStr}`);

    const fee = await getStudentFeeById(idStr);

    return res.status(200).json({
      error: false,
      body: fee,
      message: 'Fee record fetched successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to fetch fee record: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to fetch fee record',
    });
  }
}

export async function updateStudentFeeController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { monthlyAmount, totalAmount, annualFee, examFee, miscellaneousFee, labFee, includeInMonthlyCalculation, discountPercentage } = req.body;

    logger.info(`[CONTROLLER] Updating fee record: ${idStr}`);

    const studentFee = await updateStudentFee(idStr, {
      monthlyAmount,
      totalAmount,
      annualFee,
      examFee,
      miscellaneousFee,
      labFee,
      includeInMonthlyCalculation,
      discountPercentage,
    });

    return res.status(200).json({
      error: false,
      body: studentFee,
      message: 'Student fee updated successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to update student fee: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to update student fee',
    });
  }
}

export async function recordPaymentController(req: Request, res: Response) {
  try {
    const { studentFeeId, month, amount, paymentMethod, notes } = req.body;

    logger.info(`[CONTROLLER] Recording payment for fee: ${studentFeeId}`);

    const result = await recordPayment({
      studentFeeId,
      month,
      amount,
      paymentMethod,
      notes,
    });

    return res.status(201).json({
      error: false,
      body: result,
      message: 'Payment recorded successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to record payment: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to record payment',
    });
  }
}

export async function getFeePaymentsController(req: Request, res: Response) {
  try {
    const { studentFeeId } = req.params;
    const studentFeeIdStr = Array.isArray(studentFeeId) ? studentFeeId[0] : studentFeeId;

    logger.info(`[CONTROLLER] Fetching payments for fee: ${studentFeeIdStr}`);

    const payments = await getFeePayments(studentFeeIdStr);

    return res.status(200).json({
      error: false,
      body: payments,
      message: 'Payments fetched successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to fetch payments: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to fetch payments',
    });
  }
}

export async function getFeesByAcademicYearController(req: Request, res: Response) {
  try {
    const { academicYearId } = req.params;
    const academicYearIdStr = Array.isArray(academicYearId) ? academicYearId[0] : academicYearId;

    logger.info(`[CONTROLLER] Fetching fees for academic year: ${academicYearIdStr}`);

    const fees = await getFeesByAcademicYear(academicYearIdStr);

    return res.status(200).json({
      error: false,
      body: fees,
      message: 'Fees fetched successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to fetch fees by academic year: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to fetch fees',
    });
  }
}
