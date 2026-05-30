import {
  Management,
  Prisma,
  Staff,
  Student,
  Teacher,
  User,
} from "../../../generated/prisma/client";
import { prisma } from "../../libs/prisma";
import { getProfileImgUrl } from "../../config/Multer/multer";
import { AppError } from "../../config/Error/AppError";
import { HTTP_STATUS } from "../../config/Error/ErrorConstant";

interface ValidationError {
  field: string;
  message: string;
}

function validateUserData(userData: Prisma.UserCreateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!userData.firstname || userData.firstname.trim() === '') {
    errors.push({ field: 'firstname', message: 'First name is required' });
  }

  if (!userData.gender) {
    errors.push({ field: 'gender', message: 'Gender is required' });
  }

  if (!userData.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
  }

  if (!userData.address || userData.address.trim() === '') {
    errors.push({ field: 'address', message: 'Address is required' });
  }

  if (!userData.emergencyContactRelation || userData.emergencyContactRelation.trim() === '') {
    errors.push({ field: 'emergencyContactRelation', message: 'Emergency contact relation is required' });
  }

  if (!userData.emergencyContact || userData.emergencyContact.trim() === '') {
    errors.push({ field: 'emergencyContact', message: 'Emergency contact is required' });
  }

  if (!userData.email || userData.email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push({ field: 'email', message: 'Email format is invalid' });
  }

  if (!userData.role) {
    errors.push({ field: 'role', message: 'Role is required' });
  }

  if (userData.password && userData.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return errors;
}

export async function userExists(
  email: string | null,
  id: string | null,
  includePassword: boolean,
): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      OR: [{ id: id ? id : "" }, { email: email ? email : "" }],
    },
    omit: {
      password: !includePassword,
    },
  });
}

export async function createAdminUser(
  userData: Prisma.UserCreateInput,
): Promise<Omit<User, "password">> {
  const errors = validateUserData(userData);
  if (errors.length > 0) {
    const errorMessage = errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new AppError(`Validation failed: ${errorMessage}`, HTTP_STATUS.BAD_REQUEST);
  }

  return await prisma.user.create({
    data: userData,
    omit: {
      password: true,
    },
  });
}

export async function createUserWithManagement(
  userData: Prisma.UserCreateInput,
  managementData: Omit<Prisma.ManagementUncheckedCreateInput, 'userId'>,
): Promise<{
  user: Omit<User, "password">;
  management: Management;
}> {
  const errors = validateUserData(userData);
  if (errors.length > 0) {
    const errorMessage = errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new AppError(`Validation failed: ${errorMessage}`, HTTP_STATUS.BAD_REQUEST);
  }

  return await prisma.$transaction(async (tx) => {
    const userRes = await tx.user.create({
      data: userData,
      omit: {
        password: true,
      },
    });

    const managementRes = await tx.management.create({
      data: {
        ...managementData,
        userId: userRes.id,
      },
    });

    return {
      user: userRes,
      management: managementRes,
    };
  });
}

export async function createUserWithTeacher(
  userData: Prisma.UserCreateInput,
  teacherData: Omit<Prisma.TeacherUncheckedCreateInput, 'userId'>,
): Promise<{
  user: Omit<User, "password">;
  teacher: any;
}> {
  const errors = validateUserData(userData);
  if (errors.length > 0) {
    const errorMessage = errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new AppError(`Validation failed: ${errorMessage}`, HTTP_STATUS.BAD_REQUEST);
  }

  return await prisma.$transaction(async (tx) => {
    const userRes = await tx.user.create({
      data: userData,
      omit: {
        password: true,
      },
    });

    const teacherRes = await tx.teacher.create({
      data: {
        ...teacherData,
        userId: userRes.id,
      },
    });

    // Convert BigInt to string
    const serializedTeacher = {
      ...teacherRes,
      annualSalary: teacherRes.annualSalary?.toString(),
    };

    return {
      user: userRes,
      teacher: serializedTeacher,
    };
  });
}

export async function createUserWithStaff(
  userData: Prisma.UserCreateInput,
  staffData: Omit<Prisma.StaffUncheckedCreateInput, 'userId'>,
): Promise<{
  user: Omit<User, "password">;
  staff: any;
}> {
  const errors = validateUserData(userData);
  if (errors.length > 0) {
    const errorMessage = errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new AppError(`Validation failed: ${errorMessage}`, HTTP_STATUS.BAD_REQUEST);
  }

  return await prisma.$transaction(async (tx) => {
    const userRes = await tx.user.create({
      data: userData,
      omit: {
        password: true,
      },
    });

    const staffRes = await tx.staff.create({
      data: {
        ...staffData,
        userId: userRes.id,
      },
    });

    // Convert BigInt to string
    const serializedStaff = {
      ...staffRes,
      annualSalary: staffRes.annualSalary?.toString(),
    };

    return {
      user: userRes,
      staff: serializedStaff,
    };
  });
}

export async function createUserWithStudent(
  userData: Prisma.UserCreateInput,
  studentData: Omit<Prisma.StudentUncheckedCreateInput, 'userId'>,
): Promise<{
  user: Omit<User, "password">;
  student: Student;
}> {
  const errors = validateUserData(userData);
  if (errors.length > 0) {
    const errorMessage = errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new AppError(`Validation failed: ${errorMessage}`, HTTP_STATUS.BAD_REQUEST);
  }

  return await prisma.$transaction(async (tx) => {
    const userRes = await tx.user.create({
      data: userData,
      omit: {
        password: true,
      },
    });

    const studentRes = await tx.student.create({
      data: {
        ...studentData,
        userId: userRes.id,
      },
    });

    return {
      user: userRes,
      student: studentRes,
    };
  });
}

export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  role?: string,
  isActive?: string,
  requesterRole?: string,
) {
  const skip = (page - 1) * limit;
  
  // Role-based filtering: students and teachers can't see admin/management
  let allowedRoles: string[] = [];
  if (requesterRole === "STUDENT" || requesterRole === "TEACHER") {
    allowedRoles = ["STUDENT", "TEACHER", "STAFF"];
  } else if (requesterRole === "STAFF") {
    allowedRoles = ["STUDENT", "TEACHER", "STAFF"];
  } else {
    // ADMIN and MANAGEMENT can see all roles
    allowedRoles = ["ADMIN", "MANAGEMENT", "TEACHER", "STAFF", "STUDENT"];
  }

  const where: Prisma.UserWhereInput = {
    role: { in: allowedRoles },
    ...(search && {
      OR: [
        { firstname: { contains: search, mode: "insensitive" } },
        { lastname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(role && { role: role as any }),
    ...(isActive && { isActive: isActive as any }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      omit: {
        password: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Transform profileImgKey to full URL
  const usersWithImgUrl = users.map(user => ({
    ...user,
    profileImg: getProfileImgUrl(user.profileImgKey),
  }));

  return {
    users: usersWithImgUrl,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function softDeleteUser(userId: string): Promise<any> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: "DELETED" },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      gender: true,
      dateOfBirth: true,
      phone: true,
      address: true,
      emergencyContactRelation: true,
      emergencyContact: true,
      bloodGroup: true,
      nationality: true,
      religion: true,
      parentRelation: true,
      parentName: true,
      parentPhone: true,
      parentOccupation: true,
      email: true,
      profileImgKey: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
      createdById: true,
    },
  });

  return {
    ...user,
    profileImg: getProfileImgUrl(user.profileImgKey),
  };
}

export async function updateUser(
  userId: string,
  updateData: Prisma.UserUpdateInput,
): Promise<any> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      firstname: true,
      lastname: true,
      gender: true,
      dateOfBirth: true,
      phone: true,
      address: true,
      emergencyContactRelation: true,
      emergencyContact: true,
      bloodGroup: true,
      nationality: true,
      religion: true,
      parentRelation: true,
      parentName: true,
      parentPhone: true,
      parentOccupation: true,
      email: true,
      profileImgKey: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
      createdById: true,
    },
  });

  return {
    ...user,
    profileImg: getProfileImgUrl(user.profileImgKey),
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      gender: true,
      dateOfBirth: true,
      phone: true,
      address: true,
      emergencyContactRelation: true,
      emergencyContact: true,
      bloodGroup: true,
      nationality: true,
      religion: true,
      parentRelation: true,
      parentName: true,
      parentPhone: true,
      parentOccupation: true,
      email: true,
      profileImgKey: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
      createdById: true,
    },
  });

  if (!user) {
    return null;
  }

  let roleData: any = null;

  switch (user.role) {
    case "MANAGEMENT":
      roleData = await prisma.management.findUnique({
        where: { userId },
      });
      break;
    case "TEACHER":
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
      });
      if (teacher) {
        roleData = {
          ...teacher,
          annualSalary: teacher.annualSalary?.toString(),
        };
      }
      break;
    case "STAFF":
      const staff = await prisma.staff.findUnique({
        where: { userId },
      });
      if (staff) {
        roleData = {
          ...staff,
          annualSalary: staff.annualSalary?.toString(),
        };
      }
      break;
    case "STUDENT":
      roleData = await prisma.student.findUnique({
        where: { userId },
      });
      break;
  }

  return {
    user: {
      ...user,
      profileImg: getProfileImgUrl(user.profileImgKey),
    },
    roleData,
  };
}
