import { eventEmitter, Events, StudentEnrolledPayload, StudentUnenrolledPayload } from '../eventEmitter';
import { prisma } from '../../libs/prisma';
import logger from '../../libs/logger';

// Listen for student enrollment events
eventEmitter.on(Events.STUDENT_ENROLLED, async (payload: StudentEnrolledPayload) => {
  const { userId, studentId, rollNumber, className, sectionName, academicYearId } = payload;

  try {
    logger.info(`[LISTENER] Processing student enrollment for user: ${userId}`);

    // Get existing student to check academic year
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (existingStudent && existingStudent.academicYearId !== academicYearId) {
      // NEW academic year - update all student fields
      await prisma.student.update({
        where: { id: studentId },
        data: {
          rollNumber: rollNumber,
          classGrade: className,
          section: sectionName,
          academicYearId: academicYearId,
        },
      });
      logger.info(`[LISTENER] Updated student profile for new academic year: ${studentId}`);
    } else if (existingStudent && existingStudent.academicYearId === academicYearId) {
      // SAME academic year (re-enrollment) - only update roll number
      await prisma.student.update({
        where: { id: studentId },
        data: {
          rollNumber: rollNumber,
        },
      });
      logger.info(`[LISTENER] Updated roll number for same academic year: ${studentId}`);
    } else {
      // First enrollment - update all fields
      await prisma.student.update({
        where: { id: studentId },
        data: {
          rollNumber: rollNumber,
          classGrade: className,
          section: sectionName,
          academicYearId: academicYearId,
        },
      });
      logger.info(`[LISTENER] First enrollment for student: ${studentId}`);
    }

    // Update User model - set isEnrolled flag
    await prisma.user.update({
      where: { id: userId },
      data: {
        isEnrolled: true,
      },
    });

    logger.info(`[LISTENER] Successfully enrolled user: ${userId} with roll number: ${rollNumber}`);
  } catch (error: any) {
    logger.error(`[LISTENER] Failed to update student profile: ${error.message}`, {
      userId,
      studentId,
      error: error.stack,
    });
  }
});

// Listen for student unenrollment events
eventEmitter.on(Events.STUDENT_UNENROLLED, async (payload: StudentUnenrolledPayload) => {
  const { userId, studentId, status } = payload;

  try {
    logger.info(`[LISTENER] Processing student unenrollment for user: ${userId}, status: ${status}`);

    // Keep Student model fields (rollNumber, classGrade, section) for historical tracking
    // Only update User model - set isEnrolled flag to false
    await prisma.user.update({
      where: { id: userId },
      data: {
        isEnrolled: false,
      },
    });

    logger.info(`[LISTENER] Successfully unenrolled user: ${userId} - student data preserved`);
  } catch (error: any) {
    logger.error(`[LISTENER] Failed to process unenrollment: ${error.message}`, {
      userId,
      studentId,
      error: error.stack,
    });
  }
});

logger.info('[LISTENER] Student enrollment listeners registered');
