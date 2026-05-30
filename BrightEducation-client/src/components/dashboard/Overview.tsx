import React, { useState, useEffect } from 'react';
import { FiUsers, FiUser, FiClock } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';

const Overview: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isTeacher = user?.role === 'TEACHER';

  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API calls
        // For now, use mock data
        const mockTeachers = [
          { id: '1', name: 'John Doe', subjects: 'Math, Physics', todayAttendance: 'Present', joinedOn: '2024-01-15', picture: '' },
          { id: '2', name: 'Jane Smith', subjects: 'Chemistry, Biology', todayAttendance: 'Present', joinedOn: '2024-02-20', picture: '' },
        ];
        const mockStudents = [
          { id: '1', name: 'Alice Johnson', class: '10th', subjects: 'All', todayAttendance: 'Present', picture: '' },
          { id: '2', name: 'Bob Williams', class: '10th', subjects: 'All', todayAttendance: 'Absent', picture: '' },
          { id: '3', name: 'Charlie Brown', class: '10th', subjects: 'All', todayAttendance: 'Present', picture: '' },
        ];

        if (isTeacher) {
          setStudents(mockStudents);
        } else {
          setStats({ activeUsers: 5 });
          setTeachers(mockTeachers);
          setStudents(mockStudents);
        }
      } catch (e) {
        // Error fetching overview data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isTeacher]);

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>;
  }

  const totalTeachers = teachers.length;
  const presentTeachers = teachers.filter((t) => t.todayAttendance === 'Present').length;
  const totalStudents = students.length;
  const presentStudents = students.filter((s) => s.todayAttendance === 'Present').length;
  const absentStudents = students.filter((s) => s.todayAttendance === 'Absent').length;

  const recentAttendance = teachers
    .filter((t) => t.todayAttendance === 'Present')
    .slice(0, 4);

  const presentStudentsList = students
    .filter((s) => s.todayAttendance === 'Present')
    .slice(0, 4);

  if (isTeacher) {
    return (
      <div className="space-y-6">
        <WelcomeHeader userName={user?.fullName || 'User'} />
        <StudentStatsGrid
          totalStudents={totalStudents}
          presentStudents={presentStudents}
          absentStudents={absentStudents}
        />
        <PresentStudentsCard presentStudents={presentStudentsList} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeHeader userName={user?.fullName || 'User'} />
      <StatsGrid
        totalTeachers={stats?.activeUsers || totalTeachers}
        presentTeachers={presentTeachers}
        totalStudents={totalStudents}
      />
      <RecentAttendanceCard recentAttendance={recentAttendance} />
    </div>
  );
};

interface WelcomeHeaderProps { userName: string; }
function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Hello, {userName} 👋</h1>
      <p className="text-gray-600 mt-1">Welcome back to your dashboard</p>
    </div>
  );
}

interface StatsGridProps { totalTeachers: number; presentTeachers: number; totalStudents: number; }
function StatsGrid({ totalTeachers, presentTeachers, totalStudents }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={<FiUsers className="w-12 h-12 opacity-80" />} label="Total Users" value={totalTeachers} gradient="from-blue-500 to-blue-600" />
      <StatCard icon={<FiUsers className="w-12 h-12 opacity-80" />} label="Present Teachers" value={presentTeachers} gradient="from-green-500 to-green-600" />
      <StatCard icon={<FiUser className="w-12 h-12 opacity-80" />} label="Total Students" value={totalStudents} gradient="from-purple-500 to-purple-600" />
    </div>
  );
}

interface StudentStatsGridProps { totalStudents: number; presentStudents: number; absentStudents: number; }
function StudentStatsGrid({ totalStudents, presentStudents, absentStudents }: StudentStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={<FiUser className="w-12 h-12 opacity-80" />} label="Total Students" value={totalStudents} gradient="from-purple-500 to-purple-600" />
      <StatCard icon={<FiUser className="w-12 h-12 opacity-80" />} label="Present Students" value={presentStudents} gradient="from-green-500 to-green-600" />
      <StatCard icon={<FiUser className="w-12 h-12 opacity-80" />} label="Absent Students" value={absentStudents} gradient="from-red-500 to-red-600" />
    </div>
  );
}

interface StatCardProps { icon: React.ReactNode; label: string; value: number; gradient: string; }
function StatCard({ icon, label, value, gradient }: StatCardProps) {
  return (
    <div className={`bg-linear-to-br ${gradient} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">{icon}</div>
      <h3 className="text-sm font-medium opacity-90 mb-2">{label}</h3>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}

interface RecentAttendanceCardProps { recentAttendance: any[]; }
function RecentAttendanceCard({ recentAttendance }: RecentAttendanceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Attendance Marked</h2>
      {recentAttendance.length === 0 ? <p className="text-gray-500">No attendance marked today.</p> : (
        <div className="space-y-4">
          {recentAttendance.map((teacher) => (
            <AttendanceRow key={teacher.id} teacher={teacher} />
          ))}
        </div>
      )}
    </div>
  );
}

interface PresentStudentsCardProps { presentStudents: any[]; }
function PresentStudentsCard({ presentStudents }: PresentStudentsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Present Students Today</h2>
      {presentStudents.length === 0 ? <p className="text-gray-500">No students present today.</p> : (
        <div className="space-y-4">
          {presentStudents.map((student) => (
            <StudentRow key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

interface StudentRowProps { student: any; }
function StudentRow({ student }: StudentRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-purple-500 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-lg">
          {student.picture ? (
            <img src={student.picture} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = student.name[0]; }} />
          ) : (
            <span>{student.name[0]}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{student.name}</h3>
          <p className="text-sm text-gray-600">{student.class} • {student.subjects}</p>
        </div>
      </div>
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Present</span>
    </div>
  );
}

interface AttendanceRowProps { teacher: any; }
function AttendanceRow({ teacher }: AttendanceRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-lg">
          {teacher.picture ? (
            <img src={teacher.picture} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = teacher.name[0]; }} />
          ) : (
            <span>{teacher.name[0]}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
          <p className="text-sm text-gray-600">{teacher.subjects}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <FiClock className="w-4 h-4" />
        <span>Joined: {teacher.joinedOn}</span>
      </div>
    </div>
  );
}

export default Overview;
