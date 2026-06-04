import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';
import { createNotification, NotificationType, NotificationStatus, NotificationPriority } from '../Notification/notification.service';
import { emitEvent, Events, StudentEnrolledPayload, StudentUnenrolledPayload } from '../../events/eventEmitter';
import logger from '../../libs/logger';
import { createStudentFee } from '../StudentFee/studentFee.service';

export const createStudentEnrollment = async (data: { 
  studentId: string; 
  academicYearId: string; 
  sectionTenureId: string; 
  rollNumber?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'WITHDRAWN';
}) => {
  try {
    // Check if student exists and is a student
    const student = await prisma.user.findUnique({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (student.role !== 'STUDENT') {
      throw new AppError('User is not a student', 400);
    }

    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });

    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    // Check if section tenure exists
    const sectionTenure = await prisma.sectionTenure.findUnique({
      where: { id: data.sectionTenureId },
      include: {
        academicYear: true,
        studentEnrollments: true,
        classTenure: true, // Include class tenure for roll number generation
      },
    });

    if (!sectionTenure) {
      throw new AppError('Section tenure not found', 404);
    }

    // Check if section tenure belongs to the same academic year
    if (sectionTenure.academicYearId !== data.academicYearId) {
      throw new AppError('Section tenure does not belong to the specified academic year', 400);
    }

    // Check if student is already ACTIVE in this academic year
    const existingActiveEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        status: 'ACTIVE',
      },
    });

    if (existingActiveEnrollment) {
      throw new AppError('Student is already enrolled in this academic year', 400);
    }

    // Check if student has PAUSED or WRONG_ENTRY enrollment (allow re-enrollment)
    const existingPausedEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        status: { in: ['PAUSED', 'WRONG_ENTRY'] },
      },
    });

    if (existingPausedEnrollment) {
      // Update existing enrollment instead of creating new
      const updatedEnrollment = await prisma.studentEnrollment.update({
        where: { id: existingPausedEnrollment.id },
        data: {
          sectionTenureId: data.sectionTenureId,
          status: 'ACTIVE',
        },
        include: {
          academicYear: true,
          student: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true,
            },
          },
          sectionTenure: {
            include: {
              classTenure: true,
            },
          },
        },
      });

      // Generate new roll number for the new section
      let rollNumber: string;
      if (sectionTenure.rollNoPrefix) {
        const updatedSection = await prisma.sectionTenure.update({
          where: { id: sectionTenure.id },
          data: {
            rollNoCounter: {
              increment: 1,
            },
          },
        });
        const counterStr = updatedSection.rollNoCounter.toString().padStart(2, '0');
        rollNumber = `${sectionTenure.rollNoPrefix}${counterStr}`;
        logger.info(`[ENROLLMENT] Re-enrollment - Generated roll number: ${rollNumber} for section: ${sectionTenure.name}`);
      } else {
        throw new AppError('Roll number prefix not set for this section. Please configure it first.', 400);
      }

      // Update enrollment with new roll number
      const finalEnrollment = await prisma.studentEnrollment.update({
        where: { id: existingPausedEnrollment.id },
        data: { rollNumber },
        include: {
          academicYear: true,
          student: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              role: true,
            },
          },
          sectionTenure: {
            include: {
              classTenure: true,
            },
          },
        },
      });

      // Get student record for event emission
      const studentRecord = await prisma.student.findUnique({
        where: { userId: data.studentId },
      });

      if (!studentRecord) {
        throw new AppError('Student record not found', 404);
      }

      // Emit enrollment event to update Student model
      const enrollPayload: StudentEnrolledPayload = {
        userId: data.studentId,
        studentId: studentRecord.id,
        enrollmentId: finalEnrollment.id,
        rollNumber: rollNumber,
        sectionTenureId: data.sectionTenureId,
        academicYearId: data.academicYearId,
        className: finalEnrollment.sectionTenure.classTenure.name,
        sectionName: finalEnrollment.sectionTenure.name,
      };
      emitEvent(Events.STUDENT_ENROLLED, enrollPayload);

      logger.info(`[ENROLLMENT] Student re-enrolled successfully: ${data.studentId} in section: ${sectionTenure.name}`);
      return finalEnrollment;
    }

    // Check section capacity
    const currentEnrollment = sectionTenure.studentEnrollments.length;
    if (currentEnrollment >= sectionTenure.capacity) {
      throw new AppError('Section has reached maximum capacity', 400);
    }

    // Auto-generate roll number using section tenure prefix and counter
    let rollNumber: string;
    
    if (sectionTenure.rollNoPrefix) {
      // Use atomic transaction to increment counter and generate roll number
      const updatedSection = await prisma.sectionTenure.update({
        where: { id: sectionTenure.id },
        data: {
          rollNoCounter: {
            increment: 1,
          },
        },
      });
      
      // Generate roll number: prefix + padded counter (e.g., "A-01", "A-02")
      const counterStr = updatedSection.rollNoCounter.toString().padStart(2, '0');
      rollNumber = `${sectionTenure.rollNoPrefix}${counterStr}`;
      
      logger.info(`[ENROLLMENT] Auto-generated roll number: ${rollNumber} for section: ${sectionTenure.name}`);
    } else {
      throw new AppError('Roll number prefix not set for this section. Please configure it first.', 400);
    }

    // Get student record for event emission
    const studentRecord = await prisma.student.findUnique({
      where: { userId: data.studentId },
    });

    if (!studentRecord) {
      throw new AppError('Student record not found', 404);
    }

    const studentEnrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        sectionTenureId: data.sectionTenureId,
        rollNumber: rollNumber,
        status: (data.status as any) || 'ACTIVE',
      },
      include: {
        academicYear: true,
        student: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
      },
    });

    // Send notification to the student about enrollment
    await createNotification({
      type: NotificationType.STUDENT_ENROLLMENT,
      status: NotificationStatus.COMPLETED,
      userId: data.studentId,
      title: 'Enrollment Successful',
      message: `You have been enrolled in ${studentEnrollment.sectionTenure.classTenure.name} - Section ${studentEnrollment.sectionTenure.name} for the academic year ${studentEnrollment.academicYear.name}. Your roll number is ${rollNumber}.`,
      priority: NotificationPriority.NORMAL,
      data: {
        enrollmentId: studentEnrollment.id,
        academicYearId: data.academicYearId,
        sectionTenureId: data.sectionTenureId,
        className: studentEnrollment.sectionTenure.classTenure.name,
        sectionName: studentEnrollment.sectionTenure.name,
        academicYearName: studentEnrollment.academicYear.name,
        rollNumber: rollNumber,
      },
    });

    // Emit event for background processing (update Student model fields)
    const eventPayload: StudentEnrolledPayload = {
      userId: data.studentId,
      studentId: studentRecord.id,
      enrollmentId: studentEnrollment.id,
      rollNumber: rollNumber,
      sectionTenureId: data.sectionTenureId,
      academicYearId: data.academicYearId,
      className: studentEnrollment.sectionTenure.classTenure.name,
      sectionName: studentEnrollment.sectionTenure.name,
    };
    
    emitEvent(Events.STUDENT_ENROLLED, eventPayload);

    return studentEnrollment;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create student enrollment', 500);
  }
};

export const getAllStudentEnrollments = async (academicYearId?: string, sectionTenureId?: string, status?: string) => {
  try {
    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (sectionTenureId) where.sectionTenureId = sectionTenureId;
    if (status) where.status = status;
    
    const studentEnrollments = await prisma.studentEnrollment.findMany({
      where,
      include: {
        academicYear: true,
        student: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
      },
      orderBy: [
        { sectionTenure: { name: 'asc' } },
        { rollNumber: 'asc' },
      ],
    });

    return studentEnrollments;
  } catch (error) {
    throw new AppError('Failed to fetch student enrollments', 500);
  }
};

export const getStudentEnrollmentById = async (id: string) => {
  try {
    const studentEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id },
      include: {
        academicYear: true,
        student: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
      },
    });

    if (!studentEnrollment) {
      throw new AppError('Student enrollment not found', 404);
    }

    return studentEnrollment;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch student enrollment', 500);
  }
};

export const updateStudentEnrollment = async (id: string, data: {
  sectionTenureId?: string;
  rollNumber?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'WRONG_ENTRY' | 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT';
}) => {
  try {
    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id },
      include: {
        sectionTenure: true,
      },
    });

    if (!existingEnrollment) {
      throw new AppError('Student enrollment not found', 404);
    }

    // If updating section tenure, validate it belongs to the same academic year
    if (data.sectionTenureId && data.sectionTenureId !== existingEnrollment.sectionTenureId) {
      const newSection = await prisma.sectionTenure.findUnique({
        where: { id: data.sectionTenureId },
        include: {
          studentEnrollments: true,
        },
      });

      if (!newSection) {
        throw new AppError('Section tenure not found', 404);
      }

      if (newSection.academicYearId !== existingEnrollment.academicYearId) {
        throw new AppError('Section tenure does not belong to the same academic year', 400);
      }

      // Check new section capacity
      const currentEnrollment = newSection.studentEnrollments.length;
      if (currentEnrollment >= newSection.capacity) {
        throw new AppError('Section has reached maximum capacity', 400);
      }
    }

    // If updating roll number, check uniqueness within section
    if (data.rollNumber && data.rollNumber !== existingEnrollment.rollNumber) {
      const sectionId = data.sectionTenureId || existingEnrollment.sectionTenureId;
      const existingRollNumber = await prisma.studentEnrollment.findFirst({
        where: {
          sectionTenureId: sectionId,
          rollNumber: data.rollNumber,
          id: { not: id },
        },
      });

      if (existingRollNumber) {
        throw new AppError('Roll number already exists in this section', 400);
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (data.sectionTenureId !== undefined) updateData.sectionTenureId = data.sectionTenureId;
    if (data.rollNumber !== undefined) updateData.rollNumber = data.rollNumber;
    if (data.status !== undefined) updateData.status = data.status as any;

    const updatedEnrollment = await prisma.studentEnrollment.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: true,
        student: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
      },
    });

    // If status changed from ACTIVE to something else
    if (data.status && data.status !== 'ACTIVE' && existingEnrollment.status === 'ACTIVE') {
      // Get student record
      const studentRecord = await prisma.student.findUnique({
        where: { userId: existingEnrollment.studentId },
      });

      if (studentRecord) {
        // PAUSED: Don't clear student fields, just set isEnrolled to false
        if (data.status === 'PAUSED') {
          await prisma.user.update({
            where: { id: existingEnrollment.studentId },
            data: { isEnrolled: false },
          });
          logger.info(`[ENROLLMENT] Student paused: ${existingEnrollment.studentId} - fields retained`);
        }
        // WRONG_ENTRY, PROMOTED, RETAINED, DROPPED_OUT: Clear student fields
        else {
          const unenrollPayload: StudentUnenrolledPayload = {
            userId: existingEnrollment.studentId,
            studentId: studentRecord.id,
            enrollmentId: id,
            status: data.status,
          };
          emitEvent(Events.STUDENT_UNENROLLED, unenrollPayload);
        }
      }
    }
    // If status changed to ACTIVE from PAUSED/WRONG_ENTRY, update user's isEnrolled to true
    else if (data.status === 'ACTIVE' && existingEnrollment.status !== 'ACTIVE') {
      await prisma.user.update({
        where: { id: existingEnrollment.studentId },
        data: { isEnrolled: true },
      });
    }

    return updatedEnrollment;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update student enrollment', 500);
  }
};

export const deleteStudentEnrollment = async (id: string) => {
  try {
    const studentEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id },
    });

    if (!studentEnrollment) {
      throw new AppError('Student enrollment not found', 404);
    }

    // Get student record before deletion
    const studentRecord = await prisma.student.findUnique({
      where: { userId: studentEnrollment.studentId },
    });

    await prisma.studentEnrollment.delete({
      where: { id },
    });

    // Check if student has any other ACTIVE enrollments
    const remainingEnrollments = await prisma.studentEnrollment.count({
      where: { 
        studentId: studentEnrollment.studentId,
        status: 'ACTIVE'
      },
    });

    // If no more active enrollments, emit unenrollment event
    if (remainingEnrollments === 0 && studentRecord) {
      const unenrollPayload: StudentUnenrolledPayload = {
        userId: studentEnrollment.studentId,
        studentId: studentRecord.id,
        enrollmentId: id,
        status: 'DROPPED_OUT', // Default status for deletion
      };
      emitEvent(Events.STUDENT_UNENROLLED, unenrollPayload);
    }

    return { message: 'Student enrollment deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete student enrollment', 500);
  }
};

export const batchEnrollStudents = async (data: {
  studentIds: string[];
  academicYearId: string;
  sectionTenureId: string;
  feeType?: 'SCHOOL' | 'TUITION';
  feeData?: {
    monthlyAmount?: number;
    totalAmount?: number;
    annualFee?: number;
    examFee?: number;
    miscellaneousFee?: number;
    labFee?: number;
    includeInMonthlyCalculation?: boolean;
    discountPercentage?: number;
  };
}) => {
  try {
    logger.info(`[BATCH_ENROLLMENT] Starting batch enrollment for ${data.studentIds.length} students`);

    const results = {
      successful: [] as any[],
      failed: [] as any[],
    };

    // Process each student enrollment
    for (const studentId of data.studentIds) {
      try {
        // Create enrollment
        const enrollment = await createStudentEnrollment({
          studentId,
          academicYearId: data.academicYearId,
          sectionTenureId: data.sectionTenureId,
          status: 'ACTIVE',
        });

        // Create fee record if fee data provided
        if (data.feeType && data.feeData) {
          await createStudentFee({
            studentId,
            academicYearId: data.academicYearId,
            feeType: data.feeType,
            monthlyAmount: data.feeData.monthlyAmount || 0,
            totalAmount: data.feeData.totalAmount || 0,
            annualFee: data.feeData.annualFee,
            examFee: data.feeData.examFee,
            miscellaneousFee: data.feeData.miscellaneousFee,
            labFee: data.feeData.labFee,
            includeInMonthlyCalculation: data.feeData.includeInMonthlyCalculation,
            discountPercentage: data.feeData.discountPercentage,
          });
        }

        results.successful.push({
          studentId,
          enrollment,
        });
      } catch (error: any) {
        logger.error(`[BATCH_ENROLLMENT] Failed to enroll student ${studentId}: ${error.message}`);
        results.failed.push({
          studentId,
          error: error.message,
        });
      }
    }

    logger.info(`[BATCH_ENROLLMENT] Completed: ${results.successful.length} successful, ${results.failed.length} failed`);
    return results;
  } catch (error: any) {
    logger.error(`[BATCH_ENROLLMENT] Batch enrollment failed: ${error.message}`);
    throw new AppError('Failed to process batch enrollment', 500);
  }
};
