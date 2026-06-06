import { eventEmitter, Events, FeePaymentPayload } from '../eventEmitter';
import { prisma } from '../../libs/prisma';
import { createNotification } from '../../modules/Notification/notification.service';
import { NotificationType, NotificationPriority } from '../../modules/Notification/notification.service';
import logger from '../../libs/logger';

// Listen for fee payment events
eventEmitter.on(Events.FEE_PAYMENT, async (payload: FeePaymentPayload) => {
  const { userId, studentId, studentFeeId, paymentId, amount, paymentDate, paymentMethod, month, monthIndex, feeType, academicYearId } = payload;

  try {
    logger.info(`[LISTENER] Processing fee payment for user: ${userId}, amount: ${amount}`);

    // Fetch student and academic year details for notification message
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      logger.error(`[LISTENER] Student not found: ${studentId}`);
      return;
    }

    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!academicYear) {
      logger.error(`[LISTENER] Academic year not found: ${academicYearId}`);
      return;
    }

    // Format payment date
    const formattedDate = paymentDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    // Create notification title and message
    const title = 'Fee Payment Received';
    const message = `Payment of ₹${amount.toLocaleString()} received for ${feeType === 'SCHOOL' ? 'School' : 'Tuition'} fees (${month}) on ${formattedDate}. Payment method: ${paymentMethod}. Academic Year: ${academicYear.name}`;

    // Create notification for the user
    await createNotification({
      type: NotificationType.STUDENT_ENROLLMENT, // Using existing type, can add FEE_PAYMENT type later
      status: 'COMPLETED',
      userId: userId,
      relatedUserId: userId,
      data: {
        studentId,
        studentFeeId,
        paymentId,
        amount,
        paymentDate: paymentDate.toISOString(),
        paymentMethod,
        month,
        monthIndex,
        feeType,
        academicYearId,
        academicYearName: academicYear.name,
      },
      title,
      message,
      priority: NotificationPriority.NORMAL,
    });

    logger.info(`[LISTENER] Fee payment notification created for user: ${userId}`);
  } catch (error: any) {
    logger.error(`[LISTENER] Failed to create fee payment notification: ${error.message}`, {
      userId,
      studentId,
      error: error.stack,
    });
  }
});

logger.info('[LISTENER] Fee payment listener registered');
