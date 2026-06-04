import express, { Request } from "express";
import "dotenv/config";
import logger from "./libs/logger";
import { initializer } from "./config/Validation/Initializer";
import { authRouter } from "./modules/Auth/auth.routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./config/middleware/errorHandler";
import { notFound } from "./config/middleware/notFound";
import { userRouter } from "./modules/User/user.routes";
import { notificationRouter } from "./modules/Notification/notification.routes";
import { academicYearRouter } from "./modules/AcademicYear/academicYear.routes";
import classTenureRouter from "./modules/ClassTenure/classTenure.routes";
import sectionTenureRouter from "./modules/SectionTenure/sectionTenure.routes";
import classSubjectRouter from "./modules/ClassSubject/classSubject.routes";
import studentEnrollmentRouter from "./modules/StudentEnrollment/studentEnrollment.routes";
import studentFeeRouter from "./modules/StudentFee/studentFee.routes";
import classTeacherTenureRouter from "./modules/ClassTeacherTenure/classTeacherTenure.routes";
import subjectTeacherTenureRouter from "./modules/SubjectTeacherTenure/subjectTeacherTenure.routes";
import teacherTenureRouter from "./modules/TeacherTenure/teacherTenure.routes";
import staffTenureRouter from "./modules/StaffTenure/staffTenure.routes";
import managementTenureRouter from "./modules/ManagementTenure/managementTenure.routes";
import profileUpdateRouter from "./modules/ProfileUpdate/profileUpdate.routes";
import sectionManagementRouter from "./modules/SectionManagement/sectionManagement.routes";

// Register event listeners
import "./events/listeners/studentEnrollmentListener";


const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
``;
app.use(express.json());
app.use(cookieParser());
app.use((req: Request, res, next) => {
  const { method, path, ip } = req;
  const userAgent = req.headers['user-agent'] || 'unknown';
  logger.info(
    `[REQUEST] ${method} ${path} | IP: ${ip} | User-Agent: ${userAgent}`,
  );
  next();
});

await initializer();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/academic-year", academicYearRouter);
app.use("/api/v1/class-tenure", classTenureRouter);
app.use("/api/v1/section-tenure", sectionTenureRouter);
app.use("/api/v1/class-subject", classSubjectRouter);
app.use("/api/v1/student-enrollment", studentEnrollmentRouter);
app.use("/api/v1/student-fee", studentFeeRouter);
app.use("/api/v1/class-teacher-tenure", classTeacherTenureRouter);
app.use("/api/v1/subject-teacher-tenure", subjectTeacherTenureRouter);
app.use("/api/v1/teacher-tenure", teacherTenureRouter);
app.use("/api/v1/staff-tenure", staffTenureRouter);
app.use("/api/v1/management-tenure", managementTenureRouter);
app.use("/api/v1/profile-update", profileUpdateRouter);
app.use("/api/v1/section-management", sectionManagementRouter);


app.get("/", (_req, res) => {
  logger.info("[HOME] Root endpoint accessed");
  res.json({
    message: "Bright Education API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/v1/auth",
      user: "/api/v1/user",
    },
  });
});

app.use(notFound);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`[SERVER] Bright Education API started successfully`);
  logger.info(`[SERVER] Port: ${PORT}`);
  logger.info(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`[SERVER] Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  logger.info(`[SERVER] Ready to accept requests`);
});
