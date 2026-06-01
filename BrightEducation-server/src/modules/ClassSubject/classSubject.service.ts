import { AppError } from '../../config/Error/AppError';
import { prisma } from '../../libs/prisma';

export const createClassSubject = async (data: { classTenureId: string; name: string }) => {
  try {
    // Check if class tenure exists
    const classTenure = await prisma.classTenure.findUnique({
      where: { id: data.classTenureId },
    });

    if (!classTenure) {
      throw new AppError('Class tenure not found', 404);
    }

    // Check if subject with same name already exists in this class
    const existingSubject = await prisma.classSubject.findUnique({
      where: {
        classTenureId_name: {
          classTenureId: data.classTenureId,
          name: data.name,
        },
      },
    });

    if (existingSubject) {
      throw new AppError('Subject with this name already exists in this class', 400);
    }

    const classSubject = await prisma.classSubject.create({
      data,
      include: {
        classTenure: true,
      },
    });

    return classSubject;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create class subject', 500);
  }
};

export const getAllClassSubjects = async (classTenureId?: string) => {
  try {
    const where = classTenureId ? { classTenureId } : {};
    
    const classSubjects = await prisma.classSubject.findMany({
      where,
      include: {
        classTenure: true,
        subjectTeacherTenures: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return classSubjects;
  } catch (error) {
    throw new AppError('Failed to fetch class subjects', 500);
  }
};

export const getClassSubjectById = async (id: string) => {
  try {
    const classSubject = await prisma.classSubject.findUnique({
      where: { id },
      include: {
        classTenure: true,
        subjectTeacherTenures: true,
      },
    });

    if (!classSubject) {
      throw new AppError('Class subject not found', 404);
    }

    return classSubject;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch class subject', 500);
  }
};

export const updateClassSubject = async (id: string, data: { name?: string }) => {
  try {
    const existingSubject = await prisma.classSubject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      throw new AppError('Class subject not found', 404);
    }

    // If updating name, check for uniqueness
    if (data.name && data.name !== existingSubject.name) {
      const duplicateSubject = await prisma.classSubject.findUnique({
        where: {
          classTenureId_name: {
            classTenureId: existingSubject.classTenureId,
            name: data.name,
          },
        },
      });

      if (duplicateSubject) {
        throw new AppError('Subject with this name already exists in this class', 400);
      }
    }

    const updatedSubject = await prisma.classSubject.update({
      where: { id },
      data,
      include: {
        classTenure: true,
      },
    });

    return updatedSubject;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update class subject', 500);
  }
};

export const deleteClassSubject = async (id: string) => {
  try {
    const classSubject = await prisma.classSubject.findUnique({
      where: { id },
      include: {
        subjectTeacherTenures: true,
      },
    });

    if (!classSubject) {
      throw new AppError('Class subject not found', 404);
    }

    // Check if subject has assigned teachers
    if (classSubject.subjectTeacherTenures.length > 0) {
      throw new AppError('Cannot delete class subject with assigned teachers', 400);
    }

    await prisma.classSubject.delete({
      where: { id },
    });

    return { message: 'Class subject deleted successfully' };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete class subject', 500);
  }
};
