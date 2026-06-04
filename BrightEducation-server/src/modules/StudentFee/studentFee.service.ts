import { prisma } from '../../libs/prisma';
import logger from '../../libs/logger';

export async function createStudentFee(data: {
  studentId: string;
  academicYearId: string;
  feeType: string;
  monthlyAmount: number;
  totalAmount: number;
  annualFee?: number;
  examFee?: number;
  miscellaneousFee?: number;
  labFee?: number;
  includeInMonthlyCalculation?: boolean;
  discountPercentage?: number;
}) {
  try {
    logger.info(`[STUDENT_FEE] Creating fee record for student: ${data.studentId}, type: ${data.feeType}`);

    // Check if studentId is a User ID (from enrollment) or Student ID
    // If it's a User ID, fetch the Student record
    let actualStudentId = data.studentId;
    const studentRecord = await prisma.student.findUnique({
      where: { userId: data.studentId },
    });

    if (studentRecord) {
      actualStudentId = studentRecord.id;
      logger.info(`[STUDENT_FEE] Converted User ID to Student ID: ${data.studentId} -> ${actualStudentId}`);
    }

    const studentFee = await prisma.studentFee.create({
      data: {
        studentId: actualStudentId,
        academicYearId: data.academicYearId,
        feeType: data.feeType,
        monthlyAmount: data.monthlyAmount,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        balanceAmount: data.totalAmount,
        paymentStatus: 'PENDING',
        annualFee: data.annualFee,
        examFee: data.examFee || 0,
        miscellaneousFee: data.miscellaneousFee || 0,
        labFee: data.labFee || 0,
        includeInMonthlyCalculation: data.includeInMonthlyCalculation || false,
        discountPercentage: data.discountPercentage || 0,
      },
    });

    logger.info(`[STUDENT_FEE] Fee record created successfully: ${studentFee.id}`);
    return studentFee;
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to create fee record: ${error.message}`);
    throw error;
  }
}

export async function getStudentFees(studentId: string) {
  try {
    logger.info(`[STUDENT_FEE] Fetching fees for student: ${studentId}`);

    // Check if studentId is a User ID (from frontend) or Student ID
    // If it's a User ID, fetch the Student record
    let actualStudentId = studentId;
    const studentRecord = await prisma.student.findUnique({
      where: { userId: studentId },
    });

    if (studentRecord) {
      actualStudentId = studentRecord.id;
      logger.info(`[STUDENT_FEE] Converted User ID to Student ID: ${studentId} -> ${actualStudentId}`);
    }

    const fees = await prisma.studentFee.findMany({
      where: { studentId: actualStudentId },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    logger.info(`[STUDENT_FEE] Found ${fees.length} fee records for student: ${actualStudentId}`);
    return fees;
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to fetch fees: ${error.message}`);
    throw error;
  }
}

export async function getStudentFeeById(id: string) {
  try {
    logger.info(`[STUDENT_FEE] Fetching fee record: ${id}`);

    const fee = await prisma.studentFee.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!fee) {
      throw new Error('Fee record not found');
    }

    logger.info(`[STUDENT_FEE] Fee record fetched successfully: ${id}`);
    return fee;
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to fetch fee record: ${error.message}`);
    throw error;
  }
}

export async function updateStudentFee(id: string, data: {
  monthlyAmount?: number;
  totalAmount?: number;
  annualFee?: number;
  examFee?: number;
  miscellaneousFee?: number;
  labFee?: number;
  includeInMonthlyCalculation?: boolean;
  discountPercentage?: number;
}) {
  try {
    logger.info(`[STUDENT_FEE] Updating fee record: ${id}`);

    const existingFee = await prisma.studentFee.findUnique({
      where: { id },
    });

    if (!existingFee) {
      throw new Error('Fee record not found');
    }

    const updatedFee = await prisma.studentFee.update({
      where: { id },
      data: {
        monthlyAmount: data.monthlyAmount !== undefined ? data.monthlyAmount : existingFee.monthlyAmount,
        totalAmount: data.totalAmount !== undefined ? data.totalAmount : existingFee.totalAmount,
        annualFee: data.annualFee !== undefined ? data.annualFee : existingFee.annualFee,
        examFee: data.examFee !== undefined ? data.examFee : existingFee.examFee,
        miscellaneousFee: data.miscellaneousFee !== undefined ? data.miscellaneousFee : existingFee.miscellaneousFee,
        labFee: data.labFee !== undefined ? data.labFee : existingFee.labFee,
        includeInMonthlyCalculation: data.includeInMonthlyCalculation !== undefined ? data.includeInMonthlyCalculation : existingFee.includeInMonthlyCalculation,
        discountPercentage: data.discountPercentage !== undefined ? data.discountPercentage : existingFee.discountPercentage,
        balanceAmount: data.totalAmount !== undefined ? data.totalAmount : existingFee.balanceAmount,
      },
    });

    logger.info(`[STUDENT_FEE] Fee record updated successfully: ${id}`);
    return updatedFee;
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to update fee record: ${error.message}`);
    throw error;
  }
}

export async function recordPayment(data: {
  studentFeeId: string;
  month: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}) {
  try {
    logger.info(`[STUDENT_FEE] Recording payment for fee: ${data.studentFeeId}, amount: ${data.amount}`);

    // Create payment record
    const payment = await prisma.feePayment.create({
      data: {
        studentFeeId: data.studentFeeId,
        month: data.month,
        amount: data.amount,
        paymentDate: new Date(),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
    });

    // Update student fee totals
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: data.studentFeeId },
    });

    if (!studentFee) {
      throw new Error('Student fee record not found');
    }

    const newPaidAmount = Number(studentFee.paidAmount) + data.amount;
    const newBalance = Number(studentFee.totalAmount) - newPaidAmount;

    const updatedFee = await prisma.studentFee.update({
      where: { id: data.studentFeeId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalance,
        paymentStatus: newBalance === 0 ? 'PAID' : 'PARTIAL',
      },
    });

    logger.info(`[STUDENT_FEE] Payment recorded successfully: ${payment.id}`);
    return { payment, updatedFee };
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to record payment: ${error.message}`);
    throw error;
  }
}

export async function getFeePayments(studentFeeId: string) {
  try {
    logger.info(`[STUDENT_FEE] Fetching payments for fee: ${studentFeeId}`);

    const payments = await prisma.feePayment.findMany({
      where: { studentFeeId },
      orderBy: { paymentDate: 'desc' },
    });

    logger.info(`[STUDENT_FEE] Found ${payments.length} payment records for fee: ${studentFeeId}`);
    return payments;
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to fetch payments: ${error.message}`);
    throw error;
  }
}

export async function getFeesByAcademicYear(academicYearId: string) {
  try {
    logger.info(`[STUDENT_FEE] Fetching fees for academic year: ${academicYearId}`);

    const fees = await prisma.studentFee.findMany({
      where: { academicYearId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    logger.info(`[STUDENT_FEE] Found ${fees.length} fee records for academic year: ${academicYearId}`);
    return fees;
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to fetch fees by academic year: ${error.message}`);
    throw error;
  }
}
