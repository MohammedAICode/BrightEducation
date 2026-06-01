import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createClassTeacherTenure = async (data: { 
  academicYearId: string; 
  sectionTenureId: string; 
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

    // Check if section tenure exists
    const sectionTenure = await prisma.sectionTenure.findUnique({
      where: { id: data.sectionTenureId },
      include: {
        academicYear: true,
      },
    });

    if (!sectionTenure) {
      throw new AppError('Section tenure not found', 404);
    }

    // Check if section tenure belongs to the same academic year
    if (sectionTenure.academicYearId !== data.academicYearId) {
      throw new AppError('Section tenure does not belong to the specified academic year', 400);
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

    // Check if section already has a class teacher (unique constraint on sectionTenureId)
    const existingClassTeacher = await prisma.classTeacherTenure.findUnique({
      where: { sectionTenureId: data.sectionTenureId },
    });

    if (existingClassTeacher) {
      throw new AppError('Section already has a class teacher assigned', 400);
    }

    // Check if teacher is already assigned as class teacher in this academic year
    const existingTeacherAssignment = await prisma.classTeacherTenure.findUnique({
      where: {
        academicYearId_sectionTenureId: {
          academicYearId: data.academicYearId,
          sectionTenureId: data.sectionTenureId,
        },
      },
    });

    if (existingTeacherAssignment) {
      throw new AppError('Class teacher already assigned for this section in this academic year', 400);
    }

    const classTeacherTenure = await prisma.classTeacherTenure.create({
      data: {
        academicYearId: data.academicYearId,
        sectionTenureId: data.sectionTenureId,
        teacherId: data.teacherId,
        status: (data.status as any) || 'ACTIVE',
      },
      include: {
        academicYear: true,
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
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

    return classTeacherTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create class teacher tenure', 500);
  }
};

export const getAllClassTeacherTenures = async (academicYearId?: string, sectionTenureId?: string, teacherId?: string, status?: string) => {
  try {
    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (sectionTenureId) where.sectionTenureId = sectionTenureId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    
    const classTeacherTenures = await prisma.classTeacherTenure.findMany({
      where,
      include: {
        academicYear: true,
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
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

    return classTeacherTenures;
  } catch (error) {
    throw new AppError('Failed to fetch class teacher tenures', 500);
  }
};

export const getClassTeacherTenureById = async (id: string) => {
  try {
    const classTeacherTenure = await prisma.classTeacherTenure.findUnique({
      where: { id },
      include: {
        academicYear: true,
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
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

    if (!classTeacherTenure) {
      throw new AppError('Class teacher tenure not found', 404);
    }

    return classTeacherTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch class teacher tenure', 500);
  }
};

export const updateClassTeacherTenure = async (id: string, data: { 
  teacherId?: string; 
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  try {
    const existingTenure = await prisma.classTeacherTenure.findUnique({
      where: { id },
    });

    if (!existingTenure) {
      throw new AppError('Class teacher tenure not found', 404);
    }

    // If updating teacher, validate the new teacher
    if (data.teacherId && data.teacherId !== existingTenure.teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: data.teacherId },
      });

      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      if (teacher.role !== 'TEACHER') {
        throw new AppError('User is not a teacher', 400);
      }
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
    if (data.status !== undefined) updateData.status = data.status as any;

    const updatedTenure = await prisma.classTeacherTenure.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: true,
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
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
    throw new AppError('Failed to update class teacher tenure', 500);
  }
};

export const deleteClassTeacherTenure = async (id: string) => {
  try {
    const classTeacherTenure = await prisma.classTeacherTenure.findUnique({
      where: { id },
    });

    if (!classTeacherTenure) {
      throw new AppError('Class teacher tenure not found', 404);
    }

    await prisma.classTeacherTenure.delete({
      where: { id },
    });

    return { message: 'Class teacher tenure deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete class teacher tenure', 500);
  }
};
