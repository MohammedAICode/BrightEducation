import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createSubjectTeacherTenure = async (data: { 
  academicYearId: string; 
  sectionTenureId: string; 
  classSubjectId: string; 
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

    // Check if class subject exists
    const classSubject = await prisma.classSubject.findUnique({
      where: { id: data.classSubjectId },
      include: {
        classTenure: true,
      },
    });

    if (!classSubject) {
      throw new AppError('Class subject not found', 404);
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

    // Check if subject teacher already assigned for this section and subject in this academic year
    const existingAssignment = await prisma.subjectTeacherTenure.findUnique({
      where: {
        academicYearId_sectionTenureId_classSubjectId: {
          academicYearId: data.academicYearId,
          sectionTenureId: data.sectionTenureId,
          classSubjectId: data.classSubjectId,
        },
      },
    });

    if (existingAssignment) {
      throw new AppError('Subject teacher already assigned for this section and subject in this academic year', 400);
    }

    const subjectTeacherTenure = await prisma.subjectTeacherTenure.create({
      data: {
        academicYearId: data.academicYearId,
        sectionTenureId: data.sectionTenureId,
        classSubjectId: data.classSubjectId,
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
        classSubject: true,
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

    return subjectTeacherTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create subject teacher tenure', 500);
  }
};

export const getAllSubjectTeacherTenures = async (academicYearId?: string, sectionTenureId?: string, classSubjectId?: string, teacherId?: string, status?: string) => {
  try {
    const where: any = {};
    if (academicYearId) where.academicYearId = academicYearId;
    if (sectionTenureId) where.sectionTenureId = sectionTenureId;
    if (classSubjectId) where.classSubjectId = classSubjectId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    
    const subjectTeacherTenures = await prisma.subjectTeacherTenure.findMany({
      where,
      include: {
        academicYear: true,
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
        classSubject: true,
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

    return subjectTeacherTenures;
  } catch (error) {
    throw new AppError('Failed to fetch subject teacher tenures', 500);
  }
};

export const getSubjectTeacherTenureById = async (id: string) => {
  try {
    const subjectTeacherTenure = await prisma.subjectTeacherTenure.findUnique({
      where: { id },
      include: {
        academicYear: true,
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
        classSubject: true,
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

    if (!subjectTeacherTenure) {
      throw new AppError('Subject teacher tenure not found', 404);
    }

    return subjectTeacherTenure;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch subject teacher tenure', 500);
  }
};

export const updateSubjectTeacherTenure = async (id: string, data: { 
  teacherId?: string; 
  status?: 'ACTIVE' | 'INACTIVE';
}) => {
  try {
    const existingTenure = await prisma.subjectTeacherTenure.findUnique({
      where: { id },
    });

    if (!existingTenure) {
      throw new AppError('Subject teacher tenure not found', 404);
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

    const updatedTenure = await prisma.subjectTeacherTenure.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: true,
        sectionTenure: {
          include: {
            classTenure: true,
          },
        },
        classSubject: true,
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
    throw new AppError('Failed to update subject teacher tenure', 500);
  }
};

export const deleteSubjectTeacherTenure = async (id: string) => {
  try {
    const subjectTeacherTenure = await prisma.subjectTeacherTenure.findUnique({
      where: { id },
    });

    if (!subjectTeacherTenure) {
      throw new AppError('Subject teacher tenure not found', 404);
    }

    await prisma.subjectTeacherTenure.delete({
      where: { id },
    });

    return { message: 'Subject teacher tenure deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete subject teacher tenure', 500);
  }
};
