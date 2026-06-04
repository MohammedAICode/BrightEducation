import { prisma } from "../libs/prisma";
import bcrypt from "bcrypt";
import logger from "../libs/logger";

const SALT_ROUNDS = 10;

// Helper to generate random date of birth
const randomDOB = (minAge: number, maxAge: number): Date => {
  const today = new Date();
  const year = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
};

// Helper to generate random phone
const randomPhone = (): string => {
  return `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

// Indian first names
const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Ayaan", "Krishna", "Ishaan",
  "Aadhya", "Ananya", "Diya", "Isha", "Kavya", "Saanvi", "Sara", "Anika", "Navya", "Pari",
  "Rohan", "Kabir", "Reyansh", "Shaurya", "Atharv", "Advait", "Pranav", "Dhruv", "Yash", "Aarush",
  "Riya", "Priya", "Kiara", "Myra", "Aanya", "Zara", "Shanaya", "Tara", "Avni", "Nisha"
];

// Indian last names
const lastNames = [
  "Sharma", "Verma", "Patel", "Kumar", "Singh", "Reddy", "Gupta", "Joshi", "Iyer", "Nair",
  "Desai", "Mehta", "Shah", "Rao", "Pillai", "Menon", "Agarwal", "Bansal", "Chopra", "Malhotra",
  "Khan", "Ahmed", "Ali", "Siddiqui", "Ansari", "Qureshi", "Rizvi", "Hussain", "Sheikh", "Malik"
];

// Subjects for teachers
const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", 
  "Social Studies", "Computer Science", "Physical Education", "Art"
];

// Management types (from MANAGE_TYPE enum)
const managementTypes = ["ACCOUNTS", "CLASS_TEACHER", "INCHARGE"] as const;

// Cities in India
const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["MALE", "FEMALE"];
const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"];
const nationalities = ["Indian"];

// Generate random name
const randomName = () => {
  const firstname = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastname = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstname, lastname };
};

// Generate email
const generateEmail = (firstname: string, id: string): string => {
  return `${firstname.toLowerCase()}.${id.toLowerCase().replace(/[^a-z0-9]/g, '')}@bright.com`;
};

// Generate password
const generatePassword = (firstname: string, dob: Date): string => {
  const year = dob.getFullYear();
  return `${firstname}@${year}`;
};

async function seedStudents() {
  logger.info("[SEED] Creating 30 students...");
  
  for (let i = 1; i <= 30; i++) {
    const { firstname, lastname } = randomName();
    const admissionNo = `STU${String(i).padStart(4, '0')}`;
    const dob = randomDOB(10, 18);
    const gender = genders[Math.floor(Math.random() * genders.length)] as "MALE" | "FEMALE";
    const email = generateEmail(firstname, admissionNo);
    const password = generatePassword(firstname, dob);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const user = await prisma.user.create({
        data: {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          role: "STUDENT",
          gender,
          dateOfBirth: dob,
          phone: randomPhone(),
          address: `${Math.floor(Math.random() * 999) + 1}, ${cities[Math.floor(Math.random() * cities.length)]}`,
          bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
          nationality: "Indian",
          religion: religions[Math.floor(Math.random() * religions.length)],
          emergencyContact: randomPhone(),
          emergencyContactRelation: "Parent",
          parentName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastname}`,
          parentPhone: randomPhone(),
          parentRelation: "Father",
          parentOccupation: "Business",
          isActive: "ACTIVE",
          isEnrolled: false,
        },
      });

      await prisma.student.create({
        data: {
          userId: user.id,
          admissionNo,
          admissionDate: new Date(),
        },
      });

      logger.info(`[SEED] Created student: ${firstname} ${lastname} (${email}) - Password: ${password}`);
    } catch (error: any) {
      logger.error(`[SEED] Failed to create student ${firstname} ${lastname}: ${error.message}`);
    }
  }
}

async function seedTeachers() {
  logger.info("[SEED] Creating 10 teachers...");
  
  for (let i = 1; i <= 10; i++) {
    const { firstname, lastname } = randomName();
    const employeeId = `TCH${String(i).padStart(4, '0')}`;
    const dob = randomDOB(25, 50);
    const gender = genders[Math.floor(Math.random() * genders.length)] as "MALE" | "FEMALE";
    const email = generateEmail(firstname, employeeId);
    const password = generatePassword(firstname, dob);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Assign 2-3 random subjects
    const numSubjects = Math.floor(Math.random() * 2) + 2;
    const teacherSubjects = [];
    const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numSubjects; j++) {
      teacherSubjects.push(shuffledSubjects[j]);
    }

    try {
      const user = await prisma.user.create({
        data: {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          role: "TEACHER",
          gender,
          dateOfBirth: dob,
          phone: randomPhone(),
          address: `${Math.floor(Math.random() * 999) + 1}, ${cities[Math.floor(Math.random() * cities.length)]}`,
          bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
          nationality: "Indian",
          religion: religions[Math.floor(Math.random() * religions.length)],
          emergencyContact: randomPhone(),
          emergencyContactRelation: "Spouse",
          isActive: "ACTIVE",
        },
      });

      await prisma.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          joiningDate: new Date(),
          subjects: teacherSubjects,
          qualification: "B.Ed, M.A",
        },
      });

      logger.info(`[SEED] Created teacher: ${firstname} ${lastname} (${email}) - Password: ${password} - Subjects: ${teacherSubjects.join(', ')}`);
    } catch (error: any) {
      logger.error(`[SEED] Failed to create teacher ${firstname} ${lastname}: ${error.message}`);
    }
  }
}

async function seedManagement() {
  logger.info("[SEED] Creating 10 management users...");
  
  for (let i = 1; i <= 10; i++) {
    const { firstname, lastname } = randomName();
    const employeeId = `MGT${String(i).padStart(4, '0')}`;
    const dob = randomDOB(30, 60);
    const gender = genders[Math.floor(Math.random() * genders.length)] as "MALE" | "FEMALE";
    const email = generateEmail(firstname, employeeId);
    const password = generatePassword(firstname, dob);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const manageType = managementTypes[i % managementTypes.length]; // Cycle through types

    try {
      const user = await prisma.user.create({
        data: {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          role: "MANAGEMENT",
          gender,
          dateOfBirth: dob,
          phone: randomPhone(),
          address: `${Math.floor(Math.random() * 999) + 1}, ${cities[Math.floor(Math.random() * cities.length)]}`,
          bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
          nationality: "Indian",
          religion: religions[Math.floor(Math.random() * religions.length)],
          emergencyContact: randomPhone(),
          emergencyContactRelation: "Spouse",
          isActive: "ACTIVE",
        },
      });

      await prisma.management.create({
        data: {
          userId: user.id,
          employeeId,
          joiningDate: new Date(),
          manageType,
          expInYrs: Math.floor(Math.random() * 15) + 1,
        },
      });

      logger.info(`[SEED] Created management: ${firstname} ${lastname} (${email}) - Password: ${password} - Type: ${manageType}`);
    } catch (error: any) {
      logger.error(`[SEED] Failed to create management ${firstname} ${lastname}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    logger.info("[SEED] Starting user seeding process...");
    
    await seedStudents();
    await seedTeachers();
    await seedManagement();
    
    logger.info("[SEED] ✅ User seeding completed successfully!");
    logger.info("[SEED] Summary:");
    logger.info("[SEED] - 30 Students created");
    logger.info("[SEED] - 10 Teachers created");
    logger.info("[SEED] - 10 Management users created");
    logger.info("[SEED] Total: 50 users created");
    
  } catch (error: any) {
    logger.error(`[SEED] Error during seeding: ${error.message}`);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    logger.error(`[SEED] Fatal error: ${error.message}`);
    process.exit(1);
  });
