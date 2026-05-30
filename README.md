# Bright Education Management System

A comprehensive education management system built with modern web technologies, featuring user management, notifications, password reset functionality, and role-based access control.

## Project Structure

```
BrightProjectFinal/
├── BrightEducation-client/    # Frontend React application
└── BrightEducation-server/    # Backend Node.js/Express API
```

## Technologies

### Frontend (BrightEducation-client)
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **React Icons** - Icon library

### Backend (BrightEducation-server)
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database (configurable)
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Winston** - Logging

## Features

### User Management
- Multi-role support: Admin, Management, Teacher, Staff, Student
- User creation with role-specific fields
- Profile management with image upload
- Soft delete functionality
- User activation/deactivation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- Token rotation for enhanced security

### Password Reset
- Forgot password flow (email-based)
- Reset password request for logged-in users
- Admin approval workflow for password changes
- Direct password update for admins
- Notification system for password change requests

### Notification System
- Real-time notification center
- Manual refresh (no polling)
- Approval/reject actions for admins
- Multiple notification types (Password Change, Profile Update, Login Alert)
- Status tracking (Pending, Approved, Rejected, Completed)

### Dashboard
- Role-specific dashboards
- User management interface
- Notification center
- Profile management

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd BrightProjectFinal
```

2. **Install Server Dependencies**
```bash
cd BrightEducation-server
npm install
```

3. **Install Client Dependencies**
```bash
cd ../BrightEducation-client
npm install
```

4. **Configure Environment Variables**

**Server (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bright_education"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

**Client (.env)**
```env
VITE_API_URL="http://localhost:3000"
```

5. **Setup Database**
```bash
cd BrightEducation-server
npx prisma generate
npx prisma migrate dev
```

6. **Seed Database (Optional)**
```bash
npm run seed
```

### Running the Application

**Start Server**
```bash
cd BrightEducation-server
npm run dev
```
Server runs on `http://localhost:3000`

**Start Client**
```bash
cd BrightEducation-client
npm run dev
```
Client runs on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - User logout

### Password Reset
- `POST /api/auth/forgot-password` - Request password reset (forgot password)
- `POST /api/auth/reset-password-request` - Request password change (logged-in user)
- `POST /api/auth/approve-password-reset` - Approve/reject password reset (admin only)

### User Management
- `POST /api/user/register` - Create new user
- `GET /api/user` - Get all users (with pagination)
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Soft delete user

### Notifications
- `GET /api/notification` - Get user notifications
- `POST /api/notification/:id/approve` - Approve notification
- `POST /api/notification/:id/reject` - Reject notification

## User Roles

### Admin
- Full system access
- User management (create, update, delete)
- Password reset approval
- View all notifications

### Management
- Manage teachers and staff
- View student information
- Password reset approval

### Teacher
- View assigned classes
- Manage student records
- Limited user access

### Staff
- Administrative tasks
- Limited user access

### Student
- View personal information
- Request password changes
- View own notifications

## Database Schema

### User Model
- Basic information (name, email, phone, address)
- Emergency contact details
- Blood group, religion, nationality
- Profile image
- Role-based relations (Student, Teacher, Staff, Management)

### Role-Specific Models
- **Student**: Admission details, class grade, parent information
- **Teacher**: Employee ID, subjects, qualification, salary
- **Staff**: Employee ID, salary, resignation date
- **Management**: Employee ID, management type, experience

### Notification Model
- Type (Password Change, Profile Update, Login Alert)
- Status (Pending, Approved, Rejected, Completed)
- Related user and processor tracking
- Priority levels

## Development

### Code Style
- TypeScript for type safety
- ESLint for linting
- Prettier for formatting (if configured)

### Prisma Commands
```bash
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Create and apply migration
npx prisma migrate reset     # Reset database
npx prisma studio            # Open Prisma Studio
```

### Building for Production

**Server**
```bash
cd BrightEducation-server
npm run build
npm start
```

**Client**
```bash
cd BrightEducation-client
npm run build
```

## Security Features

- Password hashing using bcrypt
- JWT token authentication with refresh tokens
- Role-based access control
- Input validation
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Secure file upload handling

## Default Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@bright.com / Admin@123
- **Management**: management@bright.com / Management@123
- **Teacher**: teacher@bright.com / Teacher@123
- **Student**: student@bright.com / Student@123

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists

### Port Already in Use
- Change PORT in server .env
- Change VITE_PORT in client .env

### Prisma Migration Issues
- Run `npx prisma migrate reset` to reset database
- Check Prisma schema for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@bright.com or open an issue in the repository.
