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

  calculateTuitionFeeTotal,

  calculateSchoolFeeTotal,

  deleteFeePayment,

  getPaymentReceipt,

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

      monthlyAmount: monthlyAmount !== undefined ? parseFloat(monthlyAmount.toString()) : undefined,
      totalAmount: totalAmount !== undefined ? parseFloat(totalAmount.toString()) : undefined,
      annualFee: annualFee !== undefined ? parseFloat(annualFee.toString()) : undefined,
      examFee: examFee !== undefined ? parseFloat(examFee.toString()) : undefined,
      miscellaneousFee: miscellaneousFee !== undefined ? parseFloat(miscellaneousFee.toString()) : undefined,
      labFee: labFee !== undefined ? parseFloat(labFee.toString()) : undefined,

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

    const { studentFeeId, month, monthIndex, amount, paymentMethod, status, acceptedBy, reason, notes } = req.body;



    logger.info(`[CONTROLLER] Recording payment for fee: ${studentFeeId}`);



    const result = await recordPayment({

      studentFeeId,

      month,

      monthIndex,

      amount,

      paymentMethod,

      status,

      acceptedBy,

      reason,

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

export async function calculateTuitionFeeTotalController(req: Request, res: Response) {
  try {
    const { studentFeeId } = req.params;
    const studentFeeIdStr = Array.isArray(studentFeeId) ? studentFeeId[0] : studentFeeId;

    logger.info(`[CONTROLLER] Calculating tuition fee total for: ${studentFeeIdStr}`);

    const calculation = await calculateTuitionFeeTotal(studentFeeIdStr);

    return res.status(200).json({
      error: false,
      body: calculation,
      message: 'Tuition fee total calculated successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to calculate tuition fee total: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to calculate tuition fee total',
    });
  }
}

export async function calculateSchoolFeeTotalController(req: Request, res: Response) {
  try {
    const { studentFeeId } = req.params;
    const studentFeeIdStr = Array.isArray(studentFeeId) ? studentFeeId[0] : studentFeeId;

    logger.info(`[CONTROLLER] Calculating school fee total for: ${studentFeeIdStr}`);

    const calculation = await calculateSchoolFeeTotal(studentFeeIdStr);

    return res.status(200).json({
      error: false,
      body: calculation,
      message: 'School fee total calculated successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to calculate school fee total: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to calculate school fee total',
    });
  }
}

export async function deleteFeePaymentController(req: Request, res: Response) {
  try {
    const { studentFeeId } = req.params;
    const { paymentId, monthIndex, reasonType, reason, deletedBy } = req.body;

    const updatedFee = await deleteFeePayment(studentFeeId as string, {
      paymentId,
      monthIndex,
      reasonType,
      reason,
      deletedBy,
    });

    return res.status(200).json({
      error: false,
      body: updatedFee,
      message: 'Payment deleted successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to delete payment: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to delete payment',
    });
  }
}

export async function getPaymentReceiptController(req: Request, res: Response) {
  try {
    const { paymentId, studentFeeId, monthIndex } = req.query as any;

    const paymentIdStr = paymentId ? String(paymentId) : undefined;
    const studentFeeIdStr = studentFeeId ? String(studentFeeId) : undefined;
    const monthIndexNum = monthIndex ? parseInt(String(monthIndex), 10) : undefined;

    logger.info(`[CONTROLLER] Fetching receipt for paymentId: ${paymentIdStr}, studentFeeId: ${studentFeeIdStr}, monthIndex: ${monthIndexNum}`);

    const receipt = await getPaymentReceipt(
      paymentIdStr,
      studentFeeIdStr,
      monthIndexNum
    );

    return res.status(200).json({
      error: false,
      body: receipt,
      message: 'Receipt fetched successfully',
    });
  } catch (error: any) {
    logger.error(`[CONTROLLER] Failed to fetch receipt: ${error.message}`);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to fetch receipt',
    });
  }
}

