import { prisma } from '../../libs/prisma';
import { AppError } from '../../config/Error/AppError';
import { HTTP_STATUS } from '../../config/Error/ErrorConstant';

/**
 * Get section details with all assignments (students, teachers, subjects)
 */
export async function getSectionDetails(sectionTenureId: string) {
  const section = await prisma.sectionTenure.findUnique({
    where: { id: sectionTenureId },
    include: {
      academicYear: true,
      classTenure: {
        include: {
          classSubjects: true,
        },
      },
      studentEnrollments: {
        where: { status: 'ACTIVE' },
        include: {
          student: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              profileImg: true,
            },
          },
        },
      },
      subjectTeacherTenures: {
        where: { status: 'ACTIVE' },
        include: {
          classSubject: true,
          teacher: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              profileImg: true,
            },
          },
        },
      },
      classTeacherTenure: {
        include: {
          teacher: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              profileImg: true,
            },
          },
        },
      },
    },
  });

  if (!section) {
    throw new AppError('Section not found', HTTP_STATUS.NOT_FOUND);
  }

  return section;
}

/**
 * Get available teachers for assignment
 * Teachers must have ACTIVE status and optionally match subject qualification
 */
export async function getAvailableTeachers(academicYearId: string, subjectName?: string) {
  const teachers = await prisma.user.findMany({
    where: {
      AND: [
        { role: 'TEACHER' },
        {
          OR: [
            { isActive: 'ACTIVE' },
            { isActive: 'CREATED' },
          ],
        },
        {
          teacher: {
            isNot: null,
          },
        },
      ],
    },
    include: {
      teacher: true,
      teacherTenures: {
        where: {
          academicYearId,
          status: 'ACTIVE',
        },
      },
      subjectTeacherTenures: {
        where: {
          academicYearId,
          status: 'ACTIVE',
        },
        include: {
          classSubject: true,
          sectionTenure: {
            include: {
              classTenure: true,
            },
          },
        },
      },
      classTeacherTenures: {
        where: {
          academicYearId,
          status: 'ACTIVE',
        },
        include: {
          sectionTenure: {
            include: {
              classTenure: true,
            },
          },
        },
      },
    },
  });

  // Filter by subject if provided
  if (subjectName) {
    return teachers.filter((teacher) =>
      teacher.teacher?.subjects.includes(subjectName)
    );
  }

  return teachers;
}

/**
 * Assign a teacher to teach a subject in a section
 */
export async function assignSubjectTeacher(
  sectionTenureId: string,
  classSubjectId: string,
  teacherId: string
) {
  // Verify section exists
  const section = await prisma.sectionTenure.findUnique({
    where: { id: sectionTenureId },
    include: {
      classTenure: {
        include: {
          classSubjects: true,
        },
      },
    },
  });

  if (!section) {
    throw new AppError('Section not found', HTTP_STATUS.NOT_FOUND);
  }

  // Verify subject belongs to this class
  const subjectExists = section.classTenure.classSubjects.some(
    (subject) => subject.id === classSubjectId
  );

  if (!subjectExists) {
    throw new AppError('Subject does not belong to this class', HTTP_STATUS.BAD_REQUEST);
  }

  // Verify user exists and is active
  const user = await prisma.user.findUnique({
    where: { id: teacherId },
    include: {
      teacher: true,
      management: true,
    },
  });

  if (!user || user.isActive !== 'ACTIVE') {
    throw new AppError('User not found or inactive', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user is either a TEACHER or MANAGEMENT
  const isTeacher = user.role === 'TEACHER' && user.teacher;
  const isManagement = user.role === 'MANAGEMENT' && user.management;

  if (!isTeacher && !isManagement) {
    throw new AppError('User must be a teacher or management member', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if assignment already exists
  const existingAssignment = await prisma.subjectTeacherTenure.findUnique({
    where: {
      academicYearId_sectionTenureId_classSubjectId: {
        academicYearId: section.academicYearId,
        sectionTenureId,
        classSubjectId,
      },
    },
  });

  if (existingAssignment) {
    throw new AppError('This subject already has a teacher assigned', HTTP_STATUS.CONFLICT);
  }

  // Create teacher tenure if doesn't exist (only for TEACHER role)
  if (isTeacher) {
    await prisma.teacherTenure.upsert({
      where: {
        teacherId_academicYearId: {
          teacherId,
          academicYearId: section.academicYearId,
        },
      },
      create: {
        teacherId,
        academicYearId: section.academicYearId,
        status: 'ACTIVE',
      },
      update: {},
    });
  }

  // Create subject teacher assignment
  const assignment = await prisma.subjectTeacherTenure.create({
    data: {
      academicYearId: section.academicYearId,
      sectionTenureId,
      classSubjectId,
      teacherId,
      status: 'ACTIVE',
    },
    include: {
      classSubject: true,
      teacher: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
  });

  return assignment;
}

/**
 * Assign a class teacher to a section
 */
export async function assignClassTeacher(sectionTenureId: string, teacherId: string) {
  // Verify section exists
  const section = await prisma.sectionTenure.findUnique({
    where: { id: sectionTenureId },
    include: {
      classTeacherTenure: true,
    },
  });

  if (!section) {
    throw new AppError('Section not found', HTTP_STATUS.NOT_FOUND);
  }

  // Check if class teacher already assigned
  if (section.classTeacherTenure) {
    throw new AppError('This section already has a class teacher', HTTP_STATUS.CONFLICT);
  }

  // Verify user exists and is active
  const user = await prisma.user.findUnique({
    where: { id: teacherId },
    include: {
      management: true,
    },
  });

  if (!user || user.isActive !== 'ACTIVE') {
    throw new AppError('User not found or inactive', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user is MANAGEMENT with CLASS_TEACHER type
  const isClassTeacher = user.role === 'MANAGEMENT' && user.management?.manageType === 'CLASS_TEACHER';

  if (!isClassTeacher) {
    throw new AppError('User must be a management member with CLASS_TEACHER role', HTTP_STATUS.BAD_REQUEST);
  }

  // Assign class teacher
  const assignment = await prisma.classTeacherTenure.create({
    data: {
      academicYearId: section.academicYearId,
      sectionTenureId,
      teacherId,
      status: 'ACTIVE',
    },
    include: {
      teacher: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
  });

  return assignment;
}

/**
 * Remove subject teacher assignment
 */
export async function removeSubjectTeacher(subjectTeacherTenureId: string) {
  const assignment = await prisma.subjectTeacherTenure.findUnique({
    where: { id: subjectTeacherTenureId },
  });

  if (!assignment) {
    throw new AppError('Assignment not found', HTTP_STATUS.NOT_FOUND);
  }

  await prisma.subjectTeacherTenure.delete({
    where: { id: subjectTeacherTenureId },
  });

  return { message: 'Teacher assignment removed successfully' };
}

/**
 * Remove class teacher assignment
 */
export async function removeClassTeacher(sectionTenureId: string) {
  const assignment = await prisma.classTeacherTenure.findUnique({
    where: { sectionTenureId },
  });

  if (!assignment) {
    throw new AppError('Class teacher assignment not found', HTTP_STATUS.NOT_FOUND);
  }

  await prisma.classTeacherTenure.delete({
    where: { id: assignment.id },
  });

  return { message: 'Class teacher removed successfully' };
}

/**
 * Update tenure status
 */
export async function updateSubjectTeacherStatus(
  subjectTeacherTenureId: string,
  status: 'ACTIVE' | 'TRANSFERRED' | 'RESIGNED' | 'RETIRED'
) {
  const assignment = await prisma.subjectTeacherTenure.update({
    where: { id: subjectTeacherTenureId },
    data: { status },
    include: {
      classSubject: true,
      teacher: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
  });

  return assignment;
}
