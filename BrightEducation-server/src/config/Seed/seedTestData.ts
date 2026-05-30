import "dotenv/config";
import { Gender, Prisma, ROLE_TYPE } from "../../../generated/prisma/client";
import logger from "../../libs/logger";
import { prisma } from "../../libs/prisma";
import { protect } from "../config";

const firstNames = [
  "John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Jessica",
  "Robert", "Ashley", "William", "Stephanie", "Richard", "Jennifer", "Joseph",
  "Amanda", "Thomas", "Nicole", "Charles", "Melissa", "Christopher", "Elizabeth",
  "Daniel", "Michelle", "Matthew", "Lisa", "Anthony", "Karen", "Mark", "Nancy"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker"
];

const addresses = [
  "123 Main St, Hyderabad", "456 Oak Ave, Hyderabad", "789 Pine Rd, Hyderabad",
  "321 Elm St, Hyderabad", "654 Maple Dr, Hyderabad", "987 Cedar Ln, Hyderabad",
  "147 Birch Blvd, Hyderabad", "258 Spruce Way, Hyderabad", "369 Willow Ct, Hyderabad",
  "741 Ash St, Hyderabad", "852 Oak Ln, Hyderabad", "963 Pine Dr, Hyderabad",
  "159 Elm Ave, Hyderabad", "357 Maple St, Hyderabad", "468 Cedar Rd, Hyderabad",
  "261 Birch Way, Hyderabad", "524 Spruce St, Hyderabad", "683 Willow Ave, Hyderabad",
  "742 Ash Dr, Hyderabad", "853 Oak Ct, Hyderabad", "964 Pine Blvd, Hyderabad",
  "175 Elm Ln, Hyderabad", "286 Maple Way, Hyderabad", "397 Cedar St, Hyderabad",
  "418 Birch Ave, Hyderabad", "529 Spruce Dr, Hyderabad", "631 Willow Ln, Hyderabad",
  "742 Ash Blvd, Hyderabad", "853 Oak Way, Hyderabad", "964 Pine St, Hyderabad"
];

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "History",
  "Geography", "Computer Science", "Economics", "Psychology"
];

const departments = [
  "Administration", "Finance", "HR", "IT Support", "Maintenance",
  "Library", "Cafeteria", "Security", "Transportation", "Sports"
];

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(startYear: number, endYear: number) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month - 1, day);
}

function generatePassword(firstname: string, dateOfBirth: Date) {
  const year = dateOfBirth.getFullYear();
  return `${firstname.toLowerCase()}@${year}`;
}

export async function seedTestData() {
  try {
    logger.info(`[SEED_TEST] Starting test data seed...`);

    // Get admin user to set as createdById
    const admin = await prisma.user.findFirst({
      where: { role: ROLE_TYPE.ADMIN }
    });

    if (!admin) {
      logger.error(`[SEED_TEST] Admin user not found. Please run seed first.`);
      return;
    }

    let createdCount = { students: 0, teachers: 0, staff: 0 };

    // Create 30 Students
    for (let i = 1; i <= 30; i++) {
      const firstname = getRandomItem(firstNames);
      const lastname = getRandomItem(lastNames);
      const email = `student${i}@bright.com`;
      const dateOfBirth = getRandomDate(2005, 2015);
      const password = generatePassword(firstname, dateOfBirth);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        logger.info(`[SEED_TEST] Student with email ${email} already exists, skipping`);
        continue;
      }

      const student = await prisma.user.create({
        data: {
          email,
          password: await protect(password),
          firstname,
          lastname,
          gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
          dateOfBirth,
          phone: `91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          address: getRandomItem(addresses),
          emergencyContact: `91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          emergencyContactRelation: "Father",
          bloodGroup: getRandomItem(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
          nationality: "Indian",
          religion: getRandomItem(["Hindu", "Muslim", "Christian", "Sikh", "Other"]),
          parentRelation: "Father",
          parentName: getRandomItem(firstNames) + " " + getRandomItem(lastNames),
          parentPhone: `91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          parentOccupation: getRandomItem(["Business", "Government", "Private", "Farmer", "Teacher"]),
          role: ROLE_TYPE.STUDENT,
          isActive: "ACTIVE",
          createdById: admin.id,
        },
      });

      await prisma.student.create({
        data: {
          userId: student.id,
          admissionNo: `ADM${Date.now()}${i}`,
          admissionDate: new Date(),
          classGrade: String(Math.floor(Math.random() * 12) + 1),
          section: getRandomItem(["A", "B", "C", "D"]),
        },
      });

      createdCount.students++;
    }

    // Create 30 Teachers
    for (let i = 1; i <= 30; i++) {
      const firstname = getRandomItem(firstNames);
      const lastname = getRandomItem(lastNames);
      const email = `teacher${i}@bright.com`;
      const dateOfBirth = getRandomDate(1975, 1995);
      const password = generatePassword(firstname, dateOfBirth);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        logger.info(`[SEED_TEST] Teacher with email ${email} already exists, skipping`);
        continue;
      }

      const teacher = await prisma.user.create({
        data: {
          email,
          password: await protect(password),
          firstname,
          lastname,
          gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
          dateOfBirth,
          phone: `91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          address: getRandomItem(addresses),
          emergencyContact: `91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          emergencyContactRelation: getRandomItem(["Spouse", "Parent", "Sibling"]),
          bloodGroup: getRandomItem(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
          nationality: "Indian",
          religion: getRandomItem(["Hindu", "Muslim", "Christian", "Sikh", "Other"]),
          role: ROLE_TYPE.TEACHER,
          isActive: "ACTIVE",
          createdById: admin.id,
        },
      });

      await prisma.teacher.create({
        data: {
          userId: teacher.id,
          employeeId: `EMP${Date.now()}${i}`,
          subjects: [getRandomItem(subjects)],
          qualification: getRandomItem(["B.Ed", "M.Ed", "Ph.D", "M.A", "M.Sc"]),
          expInYrs: Math.floor(Math.random() * 20) + 1,
          joiningDate: new Date(),
          annualSalary: BigInt(Math.floor(Math.random() * 500000) + 300000),
        },
      });

      createdCount.teachers++;
    }

    // Create 30 Staff
    for (let i = 1; i <= 30; i++) {
      const firstname = getRandomItem(firstNames);
      const lastname = getRandomItem(lastNames);
      const email = `staff${i}@bright.com`;
      const dateOfBirth = getRandomDate(1975, 2000);
      const password = generatePassword(firstname, dateOfBirth);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        logger.info(`[SEED_TEST] Staff with email ${email} already exists, skipping`);
        continue;
      }

      const staff = await prisma.user.create({
        data: {
          email,
          password: await protect(password),
          firstname,
          lastname,
          gender: Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE,
          dateOfBirth,
          phone: `91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          address: getRandomItem(addresses),
          emergencyContact: `91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          emergencyContactRelation: getRandomItem(["Spouse", "Parent", "Sibling"]),
          bloodGroup: getRandomItem(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
          nationality: "Indian",
          religion: getRandomItem(["Hindu", "Muslim", "Christian", "Sikh", "Other"]),
          role: ROLE_TYPE.STAFF,
          isActive: "ACTIVE",
          createdById: admin.id,
        },
      });

      await prisma.staff.create({
        data: {
          userId: staff.id,
          employeeId: `STF${Date.now()}${i}`,
          expInYrs: Math.floor(Math.random() * 15) + 1,
          joiningDate: new Date(),
          annualSalary: BigInt(Math.floor(Math.random() * 300000) + 200000),
        },
      });

      createdCount.staff++;
    }

    logger.info(
      `[SEED_TEST] Test data seeded successfully - Students: ${createdCount.students}, Teachers: ${createdCount.teachers}, Staff: ${createdCount.staff}`
    );
  } catch (err: any) {
    logger.error(`[SEED_TEST] Error occurred: ${err.message}`);
    throw err;
  }
}

seedTestData()
  .then(() => {
    logger.info(`[SEED_TEST] Seed completed successfully`);
    process.exit(0);
  })
  .catch((err) => {
    logger.error(`[SEED_TEST] Seed failed: ${err.message}`);
    process.exit(1);
  });
