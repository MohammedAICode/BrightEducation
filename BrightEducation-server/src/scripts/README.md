# User Seeding Script

This script generates dummy users for testing the Bright Education system.

## What It Creates

- **30 Students** - With admission numbers STU0001 to STU0030
- **10 Teachers** - With employee IDs TCH0001 to TCH0010
- **10 Management** - With employee IDs MGT0001 to MGT0010

## How to Run

```bash
npm run seed:users
```

Or directly with tsx:
```bash
tsx src/scripts/seedUsers.ts
```

## Generated Data

### Students
- **Admission Numbers**: STU0001, STU0002, ..., STU0030
- **Age Range**: 10-18 years old
- **Email Format**: `firstname.stu0001@bright.com`
- **Password Format**: `firstname@birthyear` (e.g., `Aarav@2014`)
- **Status**: ACTIVE, not enrolled
- **Includes**: Full profile with parent details, emergency contacts, etc.

### Teachers
- **Employee IDs**: TCH0001, TCH0002, ..., TCH0010
- **Age Range**: 25-50 years old
- **Email Format**: `firstname.tch0001@bright.com`
- **Password Format**: `firstname@birthyear` (e.g., `Priya@1985`)
- **Subjects**: Each teacher assigned 2-3 random subjects from:
  - Mathematics, Physics, Chemistry, Biology
  - English, Hindi, Social Studies
  - Computer Science, Physical Education, Art
- **Qualification**: B.Ed, M.A

### Management
- **Employee IDs**: MGT0001, MGT0002, ..., MGT0010
- **Age Range**: 30-60 years old
- **Email Format**: `firstname.mgt0001@bright.com`
- **Password Format**: `firstname@birthyear` (e.g., `Rohan@1975`)
- **Types**: Cycles through:
  - ACCOUNTS
  - CLASS_TEACHER
  - INCHARGE
- **Experience**: 1-15 years

## Features

### Realistic Indian Data
- Indian first names (40 options)
- Indian last names (30 options)
- Indian cities for addresses
- Common blood groups
- Multiple religions
- Indian phone number format

### Automatic Generation
- Random dates of birth based on role
- Random gender assignment
- Random addresses in Indian cities
- Random blood groups
- Random emergency contacts
- Random parent/spouse details

### Password Convention
All passwords follow the format: `firstname@birthyear`
- Example: If name is "Aarav" and DOB is 2014, password is `Aarav@2014`
- Easy to remember for testing
- Unique per user

## Output

The script logs each created user with:
- Full name
- Email
- Password
- Role-specific info (subjects for teachers, type for management)

Example output:
```
[SEED] Created student: Aarav Sharma (aarav.stu0001@bright.com) - Password: Aarav@2014
[SEED] Created teacher: Priya Patel (priya.tch0001@bright.com) - Password: Priya@1985 - Subjects: Mathematics, Physics
[SEED] Created management: Rohan Kumar (rohan.mgt0001@bright.com) - Password: Rohan@1975 - Type: ACCOUNTS
```

## Important Notes

1. **Database Connection**: Ensure your database is running and connected
2. **Unique Constraints**: Script will fail if users with same email/IDs already exist
3. **Error Handling**: Individual user creation errors are logged but don't stop the script
4. **Cleanup**: To remove all seeded users, delete from database manually or use Prisma Studio

## Testing Login

After seeding, you can login with any generated user:

**Example Student Login:**
- Email: `aarav.stu0001@bright.com`
- Password: `Aarav@2014`

**Example Teacher Login:**
- Email: `priya.tch0001@bright.com`
- Password: `Priya@1985`

**Example Management Login:**
- Email: `rohan.mgt0001@bright.com`
- Password: `Rohan@1975`

## Customization

To modify the script:
- Change counts: Edit loop limits in `seedStudents()`, `seedTeachers()`, `seedManagement()`
- Add more names: Extend `firstNames` and `lastNames` arrays
- Change subjects: Modify `subjects` array
- Adjust age ranges: Change parameters in `randomDOB()` calls
- Modify ID format: Update `admissionNo` and `employeeId` generation

## Troubleshooting

**Error: User already exists**
- Delete existing users or change ID format

**Error: Database connection failed**
- Check `.env` file for correct DATABASE_URL
- Ensure PostgreSQL is running

**Error: Prisma client not generated**
- Run `npm run prisma:generate`

## Summary

Total users created: **50**
- 30 Students (60%)
- 10 Teachers (20%)
- 10 Management (20%)

All users are created with ACTIVE status and complete profile information for realistic testing scenarios.
