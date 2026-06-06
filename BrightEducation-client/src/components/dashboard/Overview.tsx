import React, { useState, useEffect } from 'react';
import { FiUsers, FiUser, FiClock, FiTrendingUp } from 'react-icons/fi';
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
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
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
      <div className="space-y-6 animate-fade-in-up">
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
    <div className="space-y-6 animate-fade-in-up">
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
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {userName} 👋</h1>
          <p className="text-blue-100/80 mt-1 text-sm">Welcome back to your dashboard</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
          <FiTrendingUp className="w-4 h-4 text-emerald-300" />
          <span className="text-sm font-medium text-white/90">All Systems Active</span>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps { totalTeachers: number; presentTeachers: number; totalStudents: number; }
function StatsGrid({ totalTeachers, presentTeachers, totalStudents }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Users" value={totalTeachers} gradient="from-blue-500 to-blue-600" iconBg="bg-blue-400/20" />
      <StatCard icon={<FiUsers className="w-6 h-6" />} label="Present Teachers" value={presentTeachers} gradient="from-emerald-500 to-emerald-600" iconBg="bg-emerald-400/20" />
      <StatCard icon={<FiUser className="w-6 h-6" />} label="Total Students" value={totalStudents} gradient="from-violet-500 to-violet-600" iconBg="bg-violet-400/20" />
    </div>
  );
}

interface StudentStatsGridProps { totalStudents: number; presentStudents: number; absentStudents: number; }
function StudentStatsGrid({ totalStudents, presentStudents, absentStudents }: StudentStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard icon={<FiUser className="w-6 h-6" />} label="Total Students" value={totalStudents} gradient="from-violet-500 to-violet-600" iconBg="bg-violet-400/20" />
      <StatCard icon={<FiUser className="w-6 h-6" />} label="Present Students" value={presentStudents} gradient="from-emerald-500 to-emerald-600" iconBg="bg-emerald-400/20" />
      <StatCard icon={<FiUser className="w-6 h-6" />} label="Absent Students" value={absentStudents} gradient="from-rose-500 to-rose-600" iconBg="bg-rose-400/20" />
    </div>
  );
}

interface StatCardProps { icon: React.ReactNode; label: string; value: number; gradient: string; iconBg: string; }
function StatCard({ icon, label, value, gradient, iconBg }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-white/80 mb-1">{label}</h3>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

interface RecentAttendanceCardProps { recentAttendance: any[]; }
function RecentAttendanceCard({ recentAttendance }: RecentAttendanceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Recent Attendance Marked</h2>
      {recentAttendance.length === 0 ? <p className="text-gray-500 text-sm">No attendance marked today.</p> : (
        <div className="space-y-3">
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Present Students Today</h2>
      {presentStudents.length === 0 ? <p className="text-gray-500 text-sm">No students present today.</p> : (
        <div className="space-y-3">
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
    <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:shadow-sm group">
      <div className="flex items-center space-x-4">
        <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl overflow-hidden flex items-center justify-center text-white font-semibold text-base shadow-sm group-hover:shadow-md transition-shadow">
          {student.picture ? (
            <img src={student.picture} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = student.name[0]; }} />
          ) : (
            <span>{student.name[0]}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{student.name}</h3>
          <p className="text-xs text-gray-500">{student.class} • {student.subjects}</p>
        </div>
      </div>
      <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Present</span>
    </div>
  );
}

interface AttendanceRowProps { teacher: any; }
function AttendanceRow({ teacher }: AttendanceRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all duration-200 hover:shadow-sm group">
      <div className="flex items-center space-x-4">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl overflow-hidden flex items-center justify-center text-white font-semibold text-base shadow-sm group-hover:shadow-md transition-shadow">
          {teacher.picture ? (
            <img src={teacher.picture} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerText = teacher.name[0]; }} />
          ) : (
            <span>{teacher.name[0]}</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{teacher.name}</h3>
          <p className="text-xs text-gray-500">{teacher.subjects}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <FiClock className="w-3.5 h-3.5" />
        <span>Joined: {teacher.joinedOn}</span>
      </div>
    </div>
  );
}

export default Overview;
