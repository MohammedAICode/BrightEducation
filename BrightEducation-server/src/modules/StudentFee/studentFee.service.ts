import { prisma } from '../../libs/prisma';

import logger from '../../libs/logger';

import { AppError } from '../../config/Error/AppError';

import { emitEvent, Events, FeePaymentPayload } from '../../events/eventEmitter';



export async function createStudentFee(data: {

  studentId: string;

  academicYearId: string;

  feeType: string;

  monthlyAmount: number;

  totalAmount?: number;
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

    // For SCHOOL fees, calculate and store totalAmount. For TUITION, leave it null for dynamic calculation
    const feeData: any = {
      studentId: actualStudentId,
      academicYearId: data.academicYearId,
      feeType: data.feeType,
      monthlyAmount: data.monthlyAmount,
      paidAmount: 0,
      paymentStatus: 'PENDING',
      annualFee: data.annualFee,
      examFee: data.examFee || 0,
      miscellaneousFee: data.miscellaneousFee || 0,
      labFee: data.labFee || 0,
      includeInMonthlyCalculation: data.includeInMonthlyCalculation || false,
      discountPercentage: data.discountPercentage || 0,
    };

    if (data.feeType === 'SCHOOL' && data.totalAmount) {
      feeData.totalAmount = data.totalAmount;
      feeData.balanceAmount = data.totalAmount;
    }

    const studentFee = await prisma.studentFee.create({

      data: feeData,

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

    
    // Preserve paid amount
    const paidAmount = parseFloat(existingFee.paidAmount.toString());
    
    // Calculate new total amount based on fee type
    let newTotalAmount: number = data.totalAmount !== undefined ? data.totalAmount : parseFloat(existingFee.totalAmount?.toString() || '0');
    
    if (existingFee.feeType === 'SCHOOL') {
      const annualFee = data.annualFee !== undefined ? Math.round(parseFloat(data.annualFee.toString()) * 100) / 100 : Math.round(parseFloat(existingFee.annualFee?.toString() || '0') * 100) / 100;
      const examFee = data.examFee !== undefined ? Math.round(parseFloat(data.examFee.toString()) * 100) / 100 : Math.round(parseFloat(existingFee.examFee?.toString() || '0') * 100) / 100;
      const miscellaneousFee = data.miscellaneousFee !== undefined ? Math.round(parseFloat(data.miscellaneousFee.toString()) * 100) / 100 : Math.round(parseFloat(existingFee.miscellaneousFee?.toString() || '0') * 100) / 100;
      const labFee = data.labFee !== undefined ? Math.round(parseFloat(data.labFee.toString()) * 100) / 100 : Math.round(parseFloat(existingFee.labFee?.toString() || '0') * 100) / 100;
      const discountPercentage = data.discountPercentage !== undefined ? Math.round(parseFloat(data.discountPercentage.toString())) : Math.round(parseFloat(existingFee.discountPercentage?.toString() || '0'));

      // Calculate base total before discount
      const baseTotal = annualFee + examFee + miscellaneousFee + labFee;

      // Apply discount with proper rounding
      const discountAmount = Math.round((baseTotal * discountPercentage) / 100 * 100) / 100;
      newTotalAmount = Math.round((baseTotal - discountAmount) * 100) / 100; // Round to 2 decimal places
    } else if (existingFee.feeType === 'TUITION') {
      // For TUITION fees, recalculate total based on monthly amount
      const monthlyAmount = data.monthlyAmount !== undefined ? data.monthlyAmount : parseFloat(existingFee.monthlyAmount?.toString() || '0');
      // The total amount for tuition is typically calculated differently
      // For now, we'll use the provided totalAmount or keep existing
      // If monthlyAmount is updated, you might want to recalculate total based on number of months
      // This depends on your business logic
    }
    
    // Calculate new balance (preserve paid amount)
    const newBalanceAmount = Math.round((newTotalAmount - paidAmount) * 100) / 100;

    const updatedFee = await prisma.studentFee.update({

      where: { id },

      data: {

        monthlyAmount: data.monthlyAmount !== undefined ? Math.round(parseFloat(data.monthlyAmount.toString()) * 100) / 100 : existingFee.monthlyAmount,

        totalAmount: Math.round(newTotalAmount * 100) / 100,

        annualFee: data.annualFee !== undefined ? Math.round(parseFloat(data.annualFee.toString()) * 100) / 100 : existingFee.annualFee,

        examFee: data.examFee !== undefined ? Math.round(parseFloat(data.examFee.toString()) * 100) / 100 : existingFee.examFee,

        miscellaneousFee: data.miscellaneousFee !== undefined ? Math.round(parseFloat(data.miscellaneousFee.toString()) * 100) / 100 : existingFee.miscellaneousFee,

        labFee: data.labFee !== undefined ? Math.round(parseFloat(data.labFee.toString()) * 100) / 100 : existingFee.labFee,

        includeInMonthlyCalculation: data.includeInMonthlyCalculation !== undefined ? data.includeInMonthlyCalculation : existingFee.includeInMonthlyCalculation,

        discountPercentage: data.discountPercentage !== undefined ? Math.round(parseFloat(data.discountPercentage.toString())) : existingFee.discountPercentage,

        balanceAmount: Math.round(newBalanceAmount * 100) / 100,

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

  monthIndex: number;
  amount: number;

  paymentMethod: string;

  status: string;

  acceptedBy?: string;

  reason?: string;

  notes?: string;

}) {

  try {

    logger.info(`[STUDENT_FEE] Recording payment for fee: ${data.studentFeeId}, amount: ${data.amount}, status: ${data.status}`);



    // Fetch student fee details to get userId and other information for the event
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: data.studentFeeId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!studentFee) {
      throw new AppError('Student fee record not found', 404);
    }

    // Check if payment record already exists for this month
    const existingPayment = await prisma.feePayment.findFirst({
      where: {
        studentFeeId: data.studentFeeId,
        monthIndex: data.monthIndex,
      },
    });

    let payment;

    if (existingPayment) {
      // Update existing payment
      payment = await prisma.feePayment.update({
        where: { id: existingPayment.id },
        data: {
          amount: data.amount,
          paymentDate: new Date(),
          paymentMethod: data.paymentMethod,
          status: data.status,
          acceptedBy: data.acceptedBy,
          reason: data.reason,
          notes: data.notes,
        },
      });
    } else {
      // Create new payment record
      payment = await prisma.feePayment.create({
        data: {
          studentFeeId: data.studentFeeId,
          month: data.month,
          monthIndex: data.monthIndex,
          amount: data.amount,
          paymentDate: new Date(),
          paymentMethod: data.paymentMethod,
          status: data.status,
          acceptedBy: data.acceptedBy,
          reason: data.reason,
          notes: data.notes,
        },
      });
    }

    // Update student fee totals only if status is PAID
    let updatedFee;
    if (data.status === 'PAID') {
      const newPaidAmount = Number(studentFee.paidAmount) + data.amount;
      const newBalance = Number(studentFee.totalAmount) - newPaidAmount;

      updatedFee = await prisma.studentFee.update({
        where: { id: data.studentFeeId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalance,
          paymentStatus: newBalance === 0 ? 'PAID' : 'PARTIAL',
        },
      });

      logger.info(`[STUDENT_FEE] Fee totals updated: paid=${newPaidAmount}, balance=${newBalance}`);
    }

    // Emit fee payment event for notification
    if (data.status === 'PAID') {
      const feePaymentPayload: FeePaymentPayload = {
        userId: studentFee.student.userId,
        studentId: studentFee.studentId,
        studentFeeId: data.studentFeeId,
        paymentId: payment.id,
        amount: data.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: data.paymentMethod,
        month: data.month,
        monthIndex: data.monthIndex,
        feeType: studentFee.feeType,
        academicYearId: studentFee.academicYearId,
      };

      emitEvent(Events.FEE_PAYMENT, feePaymentPayload);
    }

    logger.info(`[STUDENT_FEE] Payment recorded successfully: ${payment.id}`);

    return { payment, updatedFee };

  } catch (error: any) {

    logger.error(`[STUDENT_FEE] Failed to record payment: ${error.message}`);

    throw error;

  }

}



export async function getPaymentReceipt(paymentId?: string, studentFeeId?: string, monthIndex?: number) {

  try {

    logger.info(`[STUDENT_FEE] Fetching receipt for paymentId: ${paymentId}, studentFeeId: ${studentFeeId}, monthIndex: ${monthIndex}`);



    let payment;

    if (paymentId) {

      // Fetch school fee payment by paymentId
      logger.info(`[STUDENT_FEE] Fetching by paymentId: ${paymentId}`);
      payment = await prisma.feePayment.findUnique({

        where: { id: paymentId },

        include: {

          studentFee: {

            include: {

              student: {

                include: {

                  user: true,

                },

              },

              academicYear: true,

            },

          },

        },

      });

    } else if (studentFeeId && monthIndex !== undefined) {

      // Fetch tuition fee payment by studentFeeId and monthIndex
      logger.info(`[STUDENT_FEE] Fetching by studentFeeId: ${studentFeeId}, monthIndex: ${monthIndex}`);
      payment = await prisma.feePayment.findFirst({

        where: {

          studentFeeId,

          monthIndex,

        },

        include: {

          studentFee: {

            include: {

              student: {

                include: {

                  user: true,

                },

              },

              academicYear: true,

            },

          },

        },

      });

      logger.info(`[STUDENT_FEE] Payment found: ${!!payment}`);
    } else {

      throw new AppError('Either paymentId or (studentFeeId and monthIndex) must be provided', 400);

    }



    if (!payment) {

      logger.error(`[STUDENT_FEE] Payment not found. paymentId: ${paymentId}, studentFeeId: ${studentFeeId}, monthIndex: ${monthIndex}`);
      throw new AppError('Payment not found', 404);

    }

    // Fetch acceptedBy user details if exists
    if (payment.acceptedBy) {
      const acceptedByUser = await prisma.user.findUnique({
        where: { id: payment.acceptedBy },
        select: {
          id: true,
          firstname: true,
          lastname: true,
        },
      });
      if (acceptedByUser) {
        // Replace the ID with the full name
        (payment as any).acceptedByName = `${acceptedByUser.firstname} ${acceptedByUser.lastname}`;
      }
    }



    return payment;

  } catch (error: any) {

    logger.error(`[STUDENT_FEE] Failed to fetch receipt: ${error.message}`);

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

export async function calculateTuitionFeeTotal(studentFeeId: string) {
  try {
    logger.info(`[STUDENT_FEE] Calculating tuition fee total for: ${studentFeeId}`);

    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        academicYear: true,
        payments: true,
      },
    });

    if (!studentFee) {
      throw new AppError('Fee record not found', 404);
    }

    if (studentFee.feeType !== 'TUITION') {
      throw new AppError('This function is only for TUITION fee type', 400);
    }

    // Get enrollment date from student enrollment
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId: studentFee.student.user.id,
        academicYearId: studentFee.academicYearId,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    const enrollmentDate = new Date(enrollment.createdAt);
    const academicYearStart = new Date(studentFee.academicYear.startDate);
    const academicYearEnd = new Date(studentFee.academicYear.endDate);
    const monthlyAmount = parseFloat(studentFee.monthlyAmount.toString());

    // Calculate day-to-day months from enrollment date
    let currentDate = new Date(enrollmentDate);
    let totalMonths = 0;
    let extraDays = 0;

    while (currentDate < academicYearEnd) {
      const nextMonthDate = new Date(currentDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

      if (nextMonthDate <= academicYearEnd) {
        totalMonths++;
        currentDate = nextMonthDate;
      } else {
        // Calculate extra days beyond academic year end
        extraDays = Math.ceil((academicYearEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        break;
      }
    }

    // Calculate amounts
    const fullMonthsAmount = monthlyAmount * totalMonths;
    const extraDaysAmount = extraDays > 0 ? Math.round((extraDays / 30) * monthlyAmount) : 0;
    const totalAmount = fullMonthsAmount + extraDaysAmount;
    const paidAmount = parseFloat(studentFee.paidAmount.toString());
    const balanceAmount = totalAmount - paidAmount;

    // Generate month-wise breakdown
    const monthWiseBreakdown = [];
    currentDate = new Date(enrollmentDate);
    let monthIndex = 0;

    while (currentDate < academicYearEnd) {
      const nextMonthDate = new Date(currentDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

      const isLastMonth = nextMonthDate > academicYearEnd;
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const daysRemaining = isLastMonth ? Math.ceil((academicYearEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) : daysInMonth;
      const monthAmount = isLastMonth && extraDays > 0 ? Math.round((daysRemaining / daysInMonth) * monthlyAmount) : monthlyAmount;

      const currentMonthIndex = monthIndex + 1;
      const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      // Find payment for this month
      const payment = studentFee.payments.find((p) => p.monthIndex === currentMonthIndex);

      // Use actual payment amount if payment exists, otherwise use calculated month amount
      const actualAmount = payment ? parseFloat(payment.amount.toString()) : monthAmount;

      monthWiseBreakdown.push({
        monthIndex: currentMonthIndex,
        monthName: monthName,
        startDate: new Date(currentDate).toISOString(),
        endDate: isLastMonth ? academicYearEnd.toISOString() : nextMonthDate.toISOString(),
        days: daysRemaining,
        amount: actualAmount,
        isPartial: isLastMonth && extraDays > 0,
        status: payment?.status || 'PENDING',
        reason: payment?.reason || null,
      });

      currentDate = nextMonthDate;
      monthIndex++;
    }

    return {
      enrollmentDate: enrollmentDate.toISOString(),
      academicYearStart: academicYearStart.toISOString(),
      academicYearEnd: academicYearEnd.toISOString(),
      monthlyAmount,
      totalMonths,
      extraDays,
      fullMonthsAmount,
      extraDaysAmount,
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentStatus: balanceAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING',
      monthWiseBreakdown,
    };
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to calculate tuition fee total: ${error.message}`);
    throw error;
  }
}

export async function deleteFeePayment(studentFeeId: string, data: {
  paymentId?: string;
  monthIndex?: number;
  reasonType: string;
  reason: string;
  deletedBy: string;
}) {
  try {
    logger.info(`[STUDENT_FEE] Deleting payment for student fee: ${studentFeeId}, paymentId: ${data.paymentId}, monthIndex: ${data.monthIndex}`);

    // If paymentId is provided, try to delete directly
    if (data.paymentId) {
      // First verify the payment belongs to this student fee
      const payment = await prisma.feePayment.findUnique({
        where: { id: data.paymentId },
      });

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.studentFeeId !== studentFeeId) {
        throw new AppError('Payment does not belong to this student fee', 400);
      }

      // Delete the payment
      await prisma.feePayment.delete({
        where: { id: data.paymentId },
      });

      // Recalculate paid amount without re-fetching — use the already-known fee data from line 679
      const feeRecord = await prisma.studentFee.findUnique({
        where: { id: studentFeeId },
      });

      if (!feeRecord) {
        throw new AppError('Fee record not found', 404);
      }

      const currentPaid = parseFloat(feeRecord.paidAmount?.toString() || '0');
      const deletedAmount = parseFloat(payment.amount.toString());
      const newPaidAmount = Math.max(0, currentPaid - deletedAmount);
      const totalAmount = parseFloat(feeRecord.totalAmount?.toString() || '0');
      const newBalanceAmount = totalAmount - newPaidAmount;

      const updatedFee = await prisma.studentFee.update({
        where: { id: studentFeeId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
        },
      });

      logger.info(
        `[STUDENT_FEE] Payment deleted successfully. Reason: ${data.reasonType}, Details: ${data.reason}, Deleted by: ${data.deletedBy}`
      );

      return updatedFee;
    }

    // For tuition fees without paymentId, use monthIndex
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
      include: {
        payments: true,
      },
    });

    if (!studentFee) {
      throw new AppError('Fee record not found', 404);
    }

    if (data.monthIndex === undefined) {
      throw new AppError('Either paymentId or monthIndex must be provided', 400);
    }

    const paymentToDelete = studentFee.payments.find(
      (payment) => payment.monthIndex === data.monthIndex
    );

    if (!paymentToDelete) {
      throw new AppError('Payment not found for this month', 404);
    }

    // Delete the payment
    await prisma.feePayment.delete({
      where: { id: paymentToDelete.id },
    });

    // Recalculate paid amount
    const remainingPayments = studentFee.payments.filter(
      (payment) => payment.id !== paymentToDelete.id
    );
    const newPaidAmount = remainingPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()),
      0
    );

    // Update student fee with new paid amount and balance
    const totalAmount = parseFloat(studentFee.totalAmount?.toString() || '0');
    const newBalanceAmount = totalAmount - newPaidAmount;

    const updatedFee = await prisma.studentFee.update({
      where: { id: studentFeeId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
      },
    });

    // Log the deletion with reason
    logger.info(
      `[STUDENT_FEE] Payment deleted successfully. Reason: ${data.reasonType}, Details: ${data.reason}, Deleted by: ${data.deletedBy}`
    );

    return updatedFee;
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to delete payment: ${error.message}`);
    throw error;
  }
}

export async function calculateSchoolFeeTotal(studentFeeId: string) {
  try {
    logger.info(`[STUDENT_FEE] Calculating school fee total for: ${studentFeeId}`);

    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        academicYear: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!studentFee) {
      throw new AppError('Fee record not found', 404);
    }

    if (studentFee.feeType !== 'SCHOOL') {
      throw new AppError('This function is only for SCHOOL fee type', 400);
    }

    const annualFee = parseFloat(studentFee.annualFee?.toString() || '0');
    const examFee = parseFloat(studentFee.examFee?.toString() || '0');
    const miscellaneousFee = parseFloat(studentFee.miscellaneousFee?.toString() || '0');
    const labFee = parseFloat(studentFee.labFee?.toString() || '0');
    const discountPercentage = parseFloat(studentFee.discountPercentage?.toString() || '0');
    
    // Calculate base total before discount
    const baseTotal = annualFee + examFee + miscellaneousFee + labFee;
    
    // Apply discount
    const discountAmount = (baseTotal * discountPercentage) / 100;
    const totalAmount = baseTotal - discountAmount;
    
    const paidAmount = parseFloat(studentFee.paidAmount.toString());
    const balanceAmount = totalAmount - paidAmount;

    // Calculate fee components
    const feeComponents = [
      { name: 'Annual Fee', amount: annualFee },
      { name: 'Exam Fee', amount: examFee },
      { name: 'Miscellaneous Fee', amount: miscellaneousFee },
      { name: 'Lab Fee', amount: labFee },
    ];

    // Payment history
    const paymentHistory = studentFee.payments.map((payment) => ({
      id: payment.id,
      amount: parseFloat(payment.amount.toString()),
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      acceptedBy: payment.acceptedBy,
      reason: payment.reason,
      notes: payment.notes,
    }));

    return {
      feeType: 'SCHOOL',
      annualFee,
      examFee,
      miscellaneousFee,
      labFee,
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentStatus: balanceAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING',
      feeComponents,
      paymentHistory,
    };
  } catch (error: any) {
    logger.error(`[STUDENT_FEE] Failed to calculate school fee total: ${error.message}`);
    throw error;
  }
}

