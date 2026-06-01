import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';
import { createNotification, NotificationType, NotificationStatus, NotificationPriority } from '../Notification/notification.service';

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
      },
    });

    if (!sectionTenure) {
      throw new AppError('Section tenure not found', 404);
    }

    // Check if section tenure belongs to the same academic year
    if (sectionTenure.academicYearId !== data.academicYearId) {
      throw new AppError('Section tenure does not belong to the specified academic year', 400);
    }

    // Check if student is already enrolled in this academic year
    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: {
        studentId_academicYearId: {
          studentId: data.studentId,
          academicYearId: data.academicYearId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError('Student is already enrolled in this academic year', 400);
    }

    // Check section capacity
    const currentEnrollment = sectionTenure.studentEnrollments.length;
    if (currentEnrollment >= sectionTenure.capacity) {
      throw new AppError('Section has reached maximum capacity', 400);
    }

    // Check roll number uniqueness within section if provided
    if (data.rollNumber) {
      const existingRollNumber = await prisma.studentEnrollment.findFirst({
        where: {
          sectionTenureId: data.sectionTenureId,
          rollNumber: data.rollNumber,
        },
      });

      if (existingRollNumber) {
        throw new AppError('Roll number already exists in this section', 400);
      }
    }

    const studentEnrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        sectionTenureId: data.sectionTenureId,
        rollNumber: data.rollNumber,
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
      message: `You have been enrolled in ${studentEnrollment.sectionTenure.classTenure.name} - Section ${studentEnrollment.sectionTenure.name} for the academic year ${studentEnrollment.academicYear.name}.`,
      priority: NotificationPriority.NORMAL,
      data: {
        enrollmentId: studentEnrollment.id,
        academicYearId: data.academicYearId,
        sectionTenureId: data.sectionTenureId,
        className: studentEnrollment.sectionTenure.classTenure.name,
        sectionName: studentEnrollment.sectionTenure.name,
        academicYearName: studentEnrollment.academicYear.name,
      },
    });

    // Update user's isEnrolled flag
    await prisma.user.update({
      where: { id: data.studentId },
      data: { isEnrolled: true },
    });

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
  status?: 'ACTIVE' | 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT';
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

    // If status changed from ACTIVE to something else, update user's isEnrolled to false
    if (data.status && data.status !== 'ACTIVE' && existingEnrollment.status === 'ACTIVE') {
      await prisma.user.update({
        where: { id: existingEnrollment.studentId },
        data: { isEnrolled: false },
      });
    }
    // If status changed to ACTIVE from something else, update user's isEnrolled to true
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

    await prisma.studentEnrollment.delete({
      where: { id },
    });

    // Check if student has any other enrollments
    const remainingEnrollments = await prisma.studentEnrollment.count({
      where: { studentId: studentEnrollment.studentId },
    });

    // If no more enrollments, set isEnrolled to false
    if (remainingEnrollments === 0) {
      await prisma.user.update({
        where: { id: studentEnrollment.studentId },
        data: { isEnrolled: false },
      });
    }

    return { message: 'Student enrollment deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete student enrollment', 500);
  }
};
