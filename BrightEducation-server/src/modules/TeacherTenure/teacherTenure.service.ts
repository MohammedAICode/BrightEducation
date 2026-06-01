import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createTeacherTenure = async (data: { 
  academicYearId: string; 
  teacherId: string; 
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  try {
    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
    });

    if (!academicYear) {
      throw new AppError('Academic year not found', 404);
    }

    // Check if teacher exists and is a teacher
    const teacher = await prisma.user.findUnique({
      where: { id: data.teacherId },
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    if (teacher.role !== 'TEACHER') {
      throw new AppError('User is not a teacher', 400);
    }

    // Check if teacher already has a tenure in this academic year
    const existingTenure = await prisma.teacherTenure.findUnique({
      where: {
        teacherId_academicYearId: {
          teacherId: data.teacherId,
          academicYearId: data.academicYearId,
        },
      },
    });

    if (existingTenure) {
      throw new AppError('Teacher already has a tenure in this academic year', 400);
    }

    const teacherTenure = await prisma.teacherTenure.create({
      data: {
        academicYearId: data.academicYearId,
        teacherId: data.teacherId,
        status: (data.status as any) || 'ACTIVE',
      },
      include: {
        academicYear: true,
        teacher: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return teacherTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create teacher tenure', 500);
  }
};

export const getAllTeacherTenures = async (academicYearId?: string, teacherId?: string, status?: string) => {
  try {
    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    
    const teacherTenures = await prisma.teacherTenure.findMany({
      where,
      include: {
        academicYear: true,
        teacher: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        academicYear: {
          name: 'desc',
        },
      },
    });

    return teacherTenures;
  } catch (error) {
    throw new AppError('Failed to fetch teacher tenures', 500);
  }
};

export const getTeacherTenureById = async (id: string) => {
  try {
    const teacherTenure = await prisma.teacherTenure.findUnique({
      where: { id },
      include: {
        academicYear: true,
        teacher: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!teacherTenure) {
      throw new AppError('Teacher tenure not found', 404);
    }

    return teacherTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch teacher tenure', 500);
  }
};

export const updateTeacherTenure = async (id: string, data: { 
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  try {
    const existingTenure = await prisma.teacherTenure.findUnique({
      where: { id },
    });

    if (!existingTenure) {
      throw new AppError('Teacher tenure not found', 404);
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status as any;

    const updatedTenure = await prisma.teacherTenure.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: true,
        teacher: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updatedTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update teacher tenure', 500);
  }
};

export const deleteTeacherTenure = async (id: string) => {
  try {
    const teacherTenure = await prisma.teacherTenure.findUnique({
      where: { id },
    });

    if (!teacherTenure) {
      throw new AppError('Teacher tenure not found', 404);
    }

    await prisma.teacherTenure.delete({
      where: { id },
    });

    return { message: 'Teacher tenure deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete teacher tenure', 500);
  }
};
