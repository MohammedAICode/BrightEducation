import zod from "zod";

export const userCreateInput = zod.object({
  email: zod.union([zod.string().email(), zod.array(zod.string().email())]).transform(val => Array.isArray(val) ? val[0] : val),
  role: zod.union([zod.enum(["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT", "STAFF"]), zod.array(zod.enum(["ADMIN", "MANAGEMENT", "TEACHER", "STUDENT", "STAFF"]))]).transform(val => Array.isArray(val) ? val[0] : val),
  firstname: zod.union([zod.string().min(2), zod.array(zod.string().min(2))]).transform(val => Array.isArray(val) ? val[0] : val),
  lastname: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  gender: zod.union([zod.enum(["MALE", "FEMALE"]), zod.array(zod.enum(["MALE", "FEMALE"]))]).transform(val => Array.isArray(val) ? val[0] : val),
  dateOfBirth: zod.union([zod.coerce.date(), zod.array(zod.coerce.date())]).transform(val => Array.isArray(val) ? val[0] : val),
  address: zod.union([zod.string(), zod.array(zod.string())]).transform(val => Array.isArray(val) ? val[0] : val),
  emergencyContact: zod.union([zod.string(), zod.array(zod.string())]).transform(val => Array.isArray(val) ? val[0] : val),
  emergencyContactRelation: zod.union([zod.string(), zod.array(zod.string())]).transform(val => Array.isArray(val) ? val[0] : val),
  phone: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  bloodGroup: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  nationality: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  religion: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  parentRelation: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  parentName: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  parentPhone: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  parentOccupation: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  profileImgKey: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
});

// Student-specific schema with mandatory parent fields
export const studentUserCreateInput = zod.object({
  email: zod.union([zod.string().email(), zod.array(zod.string().email())]).transform(val => Array.isArray(val) ? val[0] : val),
  role: zod.union([zod.enum(["STUDENT"]), zod.array(zod.enum(["STUDENT"]))]).transform(val => Array.isArray(val) ? val[0] : val),
  firstname: zod.union([zod.string().min(2), zod.array(zod.string().min(2))]).transform(val => Array.isArray(val) ? val[0] : val),
  lastname: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  gender: zod.union([zod.enum(["MALE", "FEMALE"]), zod.array(zod.enum(["MALE", "FEMALE"]))]).transform(val => Array.isArray(val) ? val[0] : val),
  dateOfBirth: zod.union([zod.coerce.date(), zod.array(zod.coerce.date())]).transform(val => Array.isArray(val) ? val[0] : val),
  address: zod.union([zod.string(), zod.array(zod.string())]).transform(val => Array.isArray(val) ? val[0] : val),
  emergencyContact: zod.union([zod.string(), zod.array(zod.string())]).transform(val => Array.isArray(val) ? val[0] : val),
  emergencyContactRelation: zod.union([zod.string(), zod.array(zod.string())]).transform(val => Array.isArray(val) ? val[0] : val),
  phone: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  bloodGroup: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  nationality: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  religion: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  parentRelation: zod.union([zod.string().min(2), zod.array(zod.string().min(2))]).transform(val => Array.isArray(val) ? val[0] : val),
  parentName: zod.union([zod.string().min(2), zod.array(zod.string().min(2))]).transform(val => Array.isArray(val) ? val[0] : val),
  parentPhone: zod.union([zod.string().min(10), zod.array(zod.string().min(10))]).transform(val => Array.isArray(val) ? val[0] : val),
  parentOccupation: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  profileImgKey: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
});

export const managementCreateInput = zod.object({
  employeeId: zod.union([zod.string().min(3), zod.array(zod.string().min(3))]).transform(val => Array.isArray(val) ? val[0] : val),
  manageType: zod.union([zod.enum(["ACCOUNTS", "CLASS_TEACHER", "INCHARGE"]), zod.array(zod.enum(["ACCOUNTS", "CLASS_TEACHER", "INCHARGE"]))]).transform(val => Array.isArray(val) ? val[0] : val),
  joiningDate: zod.union([zod.coerce.date(), zod.array(zod.coerce.date())]).transform(val => Array.isArray(val) ? val[0] : val),
  expInYrs: zod.union([zod.coerce.number().default(0), zod.array(zod.coerce.number().default(0))]).transform(val => Array.isArray(val) ? val[0] : val).default(0),
});

export const teacherCreateInput = zod.object({
  employeeId: zod.union([zod.string().min(3), zod.array(zod.string().min(3))]).transform(val => Array.isArray(val) ? val[0] : val),
  joiningDate: zod.union([zod.coerce.date(), zod.array(zod.coerce.date())]).transform(val => Array.isArray(val) ? val[0] : val),
  expInYrs: zod.union([zod.coerce.number().default(0), zod.array(zod.coerce.number().default(0))]).transform(val => Array.isArray(val) ? val[0] : val).default(0),
  annualSalary: zod.union([zod.string().optional(), zod.number().optional(), zod.array(zod.union([zod.string(), zod.number()]))]).transform(val => {
    if (Array.isArray(val)) return val[0];
    return val;
  }).optional(),
  qualification: zod.union([zod.string(), zod.array(zod.string())]).transform(val => Array.isArray(val) ? val[0] : val),
  subjects: zod.union([zod.array(zod.string()), zod.string()]).transform(val => {
    if (typeof val === 'string') return [val];
    return val;
  }),
  resignationDate: zod.union([zod.coerce.date().optional(), zod.array(zod.coerce.date().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
});

export const staffCreateInput = zod.object({
  employeeId: zod.union([zod.string().min(3), zod.array(zod.string().min(3))]).transform(val => Array.isArray(val) ? val[0] : val),
  joiningDate: zod.union([zod.coerce.date(), zod.array(zod.coerce.date())]).transform(val => Array.isArray(val) ? val[0] : val),
  expInYrs: zod.union([zod.coerce.number().default(0), zod.array(zod.coerce.number().default(0))]).transform(val => Array.isArray(val) ? val[0] : val).default(0),
  annualSalary: zod.union([zod.string().optional(), zod.number().optional(), zod.array(zod.union([zod.string(), zod.number()]))]).transform(val => {
    if (Array.isArray(val)) return val[0];
    return val;
  }).optional(),
  resignationDate: zod.union([zod.coerce.date().optional(), zod.array(zod.coerce.date().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
});

export const studentCreateInput = zod.object({
  admissionNo: zod.union([zod.string().min(3), zod.array(zod.string().min(3))]).transform(val => Array.isArray(val) ? val[0] : val),
  admissionDate: zod.union([zod.coerce.date(), zod.array(zod.coerce.date())]).transform(val => Array.isArray(val) ? val[0] : val),
  rollNumber: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  classGrade: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
  section: zod.union([zod.string().default("A"), zod.array(zod.string().default("A"))]).transform(val => Array.isArray(val) ? val[0] : val).default("A"),
  prevSchool: zod.union([zod.string().optional(), zod.array(zod.string().optional())]).transform(val => Array.isArray(val) ? val[0] : val).optional(),
});
