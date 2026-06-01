import { useState, useEffect } from 'react';
import { FiBookOpen, FiUsers, FiCalendar, FiDollarSign, FiGrid, FiPlus, FiTrash2, FiX, FiEdit, FiBook } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';

interface ClassTenure {
  id: string;
  name: string;
  academicYearId: string;
}

interface SectionTenure {
  id: string;
  name: string;
  classTenureId: string;
  capacity: number;
}

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isActive: string;
  isEnrolled: boolean;
}

interface StudentEnrollment {
  id: string;
  studentId: string;
  academicYearId: string;
  sectionTenureId: string;
  status?: string;
}

interface ClassSubject {
  id: string;
  classTenureId: string;
  name: string;
}

interface SubjectTeacherTenure {
  id: string;
  classSubjectId: string;
  sectionTenureId: string;
  teacherId: string;
  academicYearId: string;
  status: string;
  classSubject?: ClassSubject;
  teacher?: Teacher;
}

interface ClassTeacherTenure {
  id: string;
  sectionTenureId: string;
  teacherId: string;
  academicYearId: string;
  status: string;
  teacher?: Teacher;
}

interface Teacher {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isActive: string;
  teacher?: {
    subjects: string[];
  };
  subjectTeacherTenures?: SubjectTeacherTenure[];
  classTeacherTenures?: ClassTeacherTenure[];
}

interface AcademicYearDetailProps {
  yearId: string;
}

type TabType = 'classes' | 'sections' | 'students' | 'attendance' | 'fees' | 'subjects';

export default function AcademicYearDetail({ yearId }: AcademicYearDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [classes, setClasses] = useState<ClassTenure[]>([]);
  const [sections, setSections] = useState<SectionTenure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [subjectTeacherTenures, setSubjectTeacherTenures] = useState<SubjectTeacherTenure[]>([]);
  const [classTeacherTenures, setClassTeacherTenures] = useState<ClassTeacherTenure[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedClassTeacherId, setSelectedClassTeacherId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCapacity, setNewSectionCapacity] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [enrollingStudent, setEnrollingStudent] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [unenrollEnrollmentId, setUnenrollEnrollmentId] = useState('');
  const [unenrollStatus, setUnenrollStatus] = useState<'PROMOTED' | 'RETAINED' | 'DROPPED_OUT'>('PROMOTED');
  const [enrollmentStatus, setEnrollmentStatus] = useState<'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'WITHDRAWN'>('ACTIVE');

  // Edit states
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassTenure | null>(null);
  const [editingSection, setEditingSection] = useState<SectionTenure | null>(null);
  const [editingSubject, setEditingSubject] = useState<ClassSubject | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionCapacity, setEditSectionCapacity] = useState('');
  const [editSubjectName, setEditSubjectName] = useState('');

  useEffect(() => {
    if (yearId) {
      fetchClasses();
      fetchStudents();
      fetchEnrollments();
      fetchSubjects();
    }
  }, [yearId]);

  useEffect(() => {
    if (yearId && activeTab === 'subjects') {
      fetchAvailableTeachers();
      fetchSubjectTeacherTenures();
      fetchClassTeacherTenures();
      fetchSubjects();
    }
  }, [yearId, activeTab]);

  useEffect(() => {
    if (yearId) {
      fetchAvailableTeachers();
    }
  }, [yearId]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/class-tenure');
      const filteredClasses = response.data.body.filter((cls: ClassTenure) => cls.academicYearId === yearId);
      setClasses(filteredClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (classId: string) => {
    try {
      const response = await axiosInstance.get('/section-tenure');
      const filteredSections = response.data.body.filter((sec: SectionTenure) => sec.classTenureId === classId);
      setSections(filteredSections);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('/user/all', {
        params: {
          role: 'STUDENT',
          limit: 1000, // Get all students
        },
      });
      const allStudents = response.data.body.users || [];
      setStudents(allStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await axiosInstance.get('/student-enrollment');
      const allEnrollments = response.data.body.filter((enrollment: StudentEnrollment) => enrollment.academicYearId === yearId);
      setEnrollments(allEnrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const fetchAvailableTeachers = async () => {
    try {
      // Try the section-management endpoint first
      const response = await axiosInstance.get(`/section-management/teachers/available/${yearId}`);
      
      if (response.data.body && response.data.body.length > 0) {
        setTeachers(response.data.body);
      } else {
        // Fallback: fetch all teachers using user API
        const userResponse = await axiosInstance.get('/user/all?role=TEACHER&limit=1000');
        const teachersData = userResponse.data.body?.users || [];
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      // Last resort: try user API
      try {
        const userResponse = await axiosInstance.get('/user/all?role=TEACHER&limit=1000');
        const teachersData = userResponse.data.body?.users || [];
        setTeachers(teachersData);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/class-subject');
      setSubjects(response.data.body || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchSubjectTeacherTenures = async () => {
    try {
      const response = await axiosInstance.get('/subject-teacher-tenure');
      const filteredTenures = (response.data.body || []).filter(
        (t: SubjectTeacherTenure) => t.academicYearId === yearId
      );
      setSubjectTeacherTenures(filteredTenures);
    } catch (error) {
      console.error('Failed to fetch subject teacher tenures:', error);
    }
  };

  const fetchClassTeacherTenures = async () => {
    try {
      const response = await axiosInstance.get('/class-teacher-tenure');
      const filteredTenures = (response.data.body || []).filter(
        (t: ClassTeacherTenure) => t.academicYearId === yearId
      );
      setClassTeacherTenures(filteredTenures);
    } catch (error) {
      console.error('Failed to fetch class teacher tenures:', error);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      await axiosInstance.post('/class-tenure', {
        name: newClassName,
        academicYearId: yearId,
      });
      setNewClassName('');
      fetchClasses();
    } catch (error) {
      console.error('Failed to create class:', error);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !newSectionCapacity.trim() || !selectedClass) return;

    try {
      await axiosInstance.post('/section-tenure', {
        name: newSectionName,
        classTenureId: selectedClass,
        academicYearId: yearId,
        capacity: parseInt(newSectionCapacity),
      });
      setNewSectionName('');
      setNewSectionCapacity('');
      fetchSections(selectedClass);
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedSection) return;

    try {
      setEnrollingStudent(true);
      await axiosInstance.post('/student-enrollment', {
        studentId,
        sectionTenureId: selectedSection,
        academicYearId: yearId,
        rollNumber: rollNumber || undefined,
        status: enrollmentStatus,
      });
      fetchEnrollments(); // Refresh enrollments after enrolling
      setIsEnrollModalOpen(false);
      setSelectedStudentId('');
      setRollNumber('');
      setEnrollmentStatus('ACTIVE');
    } catch (error) {
      console.error('Failed to enroll student:', error);
      alert('Failed to enroll student');
    } finally {
      setEnrollingStudent(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await axiosInstance.delete(`/class-tenure/${classId}`);
      fetchClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      await axiosInstance.delete(`/section-tenure/${sectionId}`);
      fetchSections(selectedClass);
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleUnenrollStudent = (enrollmentId: string) => {
    setUnenrollEnrollmentId(enrollmentId);
    setUnenrollStatus('PROMOTED');
    setIsUnenrollModalOpen(true);
  };

  const handleConfirmUnenroll = async () => {
    try {
      await axiosInstance.patch(`/student-enrollment/${unenrollEnrollmentId}`, {
        status: unenrollStatus,
      });
      setSuccess(`Student status updated to ${unenrollStatus}`);
      setTimeout(() => setSuccess(null), 3000);
      setIsUnenrollModalOpen(false);
      fetchEnrollments();
    } catch (error) {
      console.error('Failed to update enrollment status:', error);
      setError('Failed to update enrollment status');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Edit handlers
  const handleEditClass = (cls: ClassTenure) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setIsEditClassModalOpen(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim()) return;

    try {
      await axiosInstance.patch(`/class-tenure/${editingClass.id}`, {
        name: editClassName,
      });
      setIsEditClassModalOpen(false);
      setEditingClass(null);
      setEditClassName('');
      fetchClasses();
    } catch (error) {
      console.error('Failed to update class:', error);
      alert('Failed to update class');
    }
  };

  const handleEditSection = (section: SectionTenure) => {
    setEditingSection(section);
    setEditSectionName(section.name);
    setEditSectionCapacity(section.capacity.toString());
    setIsEditSectionModalOpen(true);
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editSectionName.trim() || !editSectionCapacity.trim()) return;

    try {
      await axiosInstance.patch(`/section-tenure/${editingSection.id}`, {
        name: editSectionName,
        capacity: parseInt(editSectionCapacity),
      });
      setIsEditSectionModalOpen(false);
      setEditingSection(null);
      setEditSectionName('');
      setEditSectionCapacity('');
      fetchSections(selectedClass);
    } catch (error) {
      console.error('Failed to update section:', error);
      alert('Failed to update section');
    }
  };

  const handleEditSubject = (subject: ClassSubject) => {
    setEditingSubject(subject);
    setEditSubjectName(subject.name);
    setIsEditSubjectModalOpen(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectName.trim()) return;

    try {
      await axiosInstance.patch(`/class-subject/${editingSubject.id}`, {
        name: editSubjectName,
      });
      setIsEditSubjectModalOpen(false);
      setEditingSubject(null);
      setEditSubjectName('');
      fetchSubjects();
    } catch (error) {
      console.error('Failed to update subject:', error);
      alert('Failed to update subject');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedClass) return;

    try {
      await axiosInstance.post('/class-subject', {
        name: newSubjectName,
        classTenureId: selectedClass,
      });
      setNewSubjectName('');
      fetchSubjects();
    } catch (error) {
      console.error('Failed to create subject:', error);
      alert('Failed to create subject');
    }
  };

  const handleAssignSubjectTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedSection || !selectedTeacherId) return;

    try {
      setError(null);
      await axiosInstance.post('/section-management/subject-teacher/assign', {
        classSubjectId: selectedSubjectId,
        sectionTenureId: selectedSection,
        teacherId: selectedTeacherId,
      });
      setSelectedSubjectId('');
      setSelectedTeacherId('');
      setSuccess('Subject teacher assigned successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchSubjectTeacherTenures();
      fetchAvailableTeachers();
    } catch (error: any) {
      console.error('Failed to assign subject teacher:', error);
      setError(error.response?.data?.message || 'Failed to assign subject teacher');
    }
  };

  const handleAssignClassTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection || !selectedClassTeacherId) return;

    try {
      setError(null);
      await axiosInstance.post('/section-management/class-teacher/assign', {
        sectionTenureId: selectedSection,
        teacherId: selectedClassTeacherId,
      });
      setSelectedClassTeacherId('');
      setSuccess('Class teacher assigned successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchClassTeacherTenures();
      fetchAvailableTeachers();
    } catch (error: any) {
      console.error('Failed to assign class teacher:', error);
      setError(error.response?.data?.message || 'Failed to assign class teacher');
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await axiosInstance.delete(`/class-subject/${subjectId}`);
      fetchSubjects();
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const handleDeleteSubjectTeacher = async (tenureId: string) => {
    if (!confirm('Are you sure you want to remove this subject teacher assignment?')) return;

    try {
      setError(null);
      await axiosInstance.delete(`/section-management/subject-teacher/${tenureId}`);
      setSuccess('Subject teacher removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchSubjectTeacherTenures();
      fetchAvailableTeachers();
    } catch (error: any) {
      console.error('Failed to remove subject teacher:', error);
      setError(error.response?.data?.message || 'Failed to remove subject teacher');
    }
  };

  const handleDeleteClassTeacher = async (sectionId: string) => {
    if (!confirm('Are you sure you want to remove the class teacher?')) return;

    try {
      setError(null);
      await axiosInstance.delete(`/section-management/class-teacher/${sectionId}`);
      setSuccess('Class teacher removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchClassTeacherTenures();
      fetchAvailableTeachers();
    } catch (error: any) {
      console.error('Failed to remove class teacher:', error);
      setError(error.response?.data?.message || 'Failed to remove class teacher');
    }
  };

  const tabs = [
    { id: 'classes' as TabType, label: 'Classes', icon: <FiBookOpen className="w-5 h-5" /> },
    { id: 'sections' as TabType, label: 'Sections', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'subjects' as TabType, label: 'Subjects', icon: <FiBook className="w-5 h-5" /> },
    { id: 'students' as TabType, label: 'Students', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'attendance' as TabType, label: 'Attendance', icon: <FiCalendar className="w-5 h-5" /> },
    { id: 'fees' as TabType, label: 'Fees', icon: <FiDollarSign className="w-5 h-5" /> },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Academic Year Details</h1>
        <p className="text-gray-600 mt-1">Manage classes, sections, students, attendance, and fees</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filters for Students, Attendance, Fees */}
      {(activeTab === 'students' || activeTab === 'attendance' || activeTab === 'fees') && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <div>
            {activeTab === 'classes' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
                </div>

                {/* Create Class Form */}
                <form onSubmit={handleCreateClass} className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Enter class name (e.g., Class 10)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add Class</span>
                    </button>
                  </div>
                </form>

                {classes.length === 0 ? (
                  <p className="text-gray-500">No classes found for this academic year.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Class Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Sections</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Enrolled Students</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls) => {
                        const classSections = sections.filter((s) => s.classTenureId === cls.id);
                        const classSectionIds = classSections.map((s) => s.id);
                        const enrolledCount = enrollments.filter((e) => classSectionIds.includes(e.sectionTenureId)).length;
                        return (
                          <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FiBookOpen className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-900">{cls.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{classSections.length}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{enrolledCount}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClass(cls)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit class"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(cls.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete class"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'sections' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
                </div>

                {/* Class Selector for Sections */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Create Section Form */}
                {selectedClass && (
                  <form onSubmit={handleCreateSection} className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="Enter section name (e.g., A)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={newSectionCapacity}
                        onChange={(e) => setNewSectionCapacity(e.target.value)}
                        placeholder="Capacity"
                        min="1"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        <span>Add Section</span>
                      </button>
                    </div>
                  </form>
                )}

                {!selectedClass ? (
                  <p className="text-gray-500">Please select a class to view sections.</p>
                ) : sections.length === 0 ? (
                  <p className="text-gray-500">No sections found for this class.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Section Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Capacity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Enrolled Students</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map((sec) => {
                        const enrolledCount = enrollments.filter((e) => e.sectionTenureId === sec.id).length;
                        return (
                          <tr key={sec.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <FiGrid className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="font-medium text-gray-900">{sec.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{sec.capacity}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{enrolledCount}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditSection(sec)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit section"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(sec.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete section"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'subjects' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Subjects & Teachers</h2>
                </div>

                {/* Success/Error Messages */}
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                {/* Class and Section Selector */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={!selectedClass}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Section</option>
                      {sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Create Subject Form */}
                {selectedClass && (
                  <form onSubmit={handleCreateSubject} className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <select
                          value={newSubjectName === 'Other' || (newSubjectName && !['Mathematics', 'English', 'Hindi', 'Science', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Geography', 'Economics', 'Accountancy', 'Business Studies', 'Physical Education', 'Sanskrit', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'].includes(newSubjectName)) ? 'Other' : newSubjectName}
                          onChange={(e) => {
                            if (e.target.value === 'Other') {
                              setNewSubjectName('');
                            } else {
                              setNewSubjectName(e.target.value);
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Subject</option>
                          <optgroup label="Core Subjects">
                            <option value="Mathematics">Mathematics</option>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Science">Science</option>
                            <option value="Social Studies">Social Studies</option>
                          </optgroup>
                          <optgroup label="Sciences">
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="Computer Science">Computer Science</option>
                          </optgroup>
                          <optgroup label="Commerce">
                            <option value="Accountancy">Accountancy</option>
                            <option value="Business Studies">Business Studies</option>
                            <option value="Economics">Economics</option>
                          </optgroup>
                          <optgroup label="Humanities">
                            <option value="History">History</option>
                            <option value="Geography">Geography</option>
                            <option value="Political Science">Political Science</option>
                          </optgroup>
                          <optgroup label="Languages">
                            <option value="Sanskrit">Sanskrit</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Kannada">Kannada</option>
                            <option value="Malayalam">Malayalam</option>
                          </optgroup>
                          <optgroup label="Others">
                            <option value="Physical Education">Physical Education</option>
                            <option value="Art">Art</option>
                            <option value="Music">Music</option>
                          </optgroup>
                          <option value="Other">Other (Custom Subject)</option>
                        </select>
                        <button
                          type="submit"
                          disabled={!newSubjectName.trim()}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiPlus className="w-4 h-4" />
                          <span>Add Subject</span>
                        </button>
                      </div>
                      {(newSubjectName === '' || (newSubjectName && !['Mathematics', 'English', 'Hindi', 'Science', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Geography', 'Economics', 'Accountancy', 'Business Studies', 'Physical Education', 'Sanskrit', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Political Science', 'Art', 'Music'].includes(newSubjectName))) && (
                        <input
                          type="text"
                          value={newSubjectName === 'Other' ? '' : newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          placeholder="Enter custom subject name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </form>
                )}

                {/* Subjects Table */}
                {selectedClass ? (
                  <>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Subjects for {classes.find(c => c.id === selectedClass)?.name}</h3>
                    {subjects.filter(s => s.classTenureId === selectedClass).length === 0 ? (
                      <p className="text-gray-500 mb-6">No subjects found for this class.</p>
                    ) : (
                      <table className="w-full mb-6">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Subject Name</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.filter(s => s.classTenureId === selectedClass).map((subject) => (
                            <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <FiBook className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <span className="font-medium text-gray-900">{subject.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleEditSubject(subject)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit subject"
                                  >
                                    <FiEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubject(subject.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete subject"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 mb-6">Please select a class to view subjects.</p>
                )}

                {/* Assign Subject Teacher Form */}
                {selectedClass && selectedSection && subjects.filter(s => s.classTenureId === selectedClass).length > 0 && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Assign Subject Teacher</h3>
                    <form onSubmit={handleAssignSubjectTeacher}>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          <select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Subject</option>
                            {subjects.filter(s => s.classTenureId === selectedClass).map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                          <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Teacher</option>
                            {teachers.filter(t => t.isActive === 'ACTIVE' || t.isActive === 'CREATED').map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.firstname} {teacher.lastname}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FiPlus className="w-4 h-4" />
                            <span>Assign</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Class Teacher Assignment */}
                {selectedSection && (
                  <>
                    {(() => {
                      const classTeacher = classTeacherTenures.find(ct => ct.sectionTenureId === selectedSection);
                      const teacher = classTeacher ? teachers.find(t => t.id === classTeacher.teacherId) : null;
                      
                      return (
                        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
                          <h3 className="text-md font-semibold text-gray-900 mb-3">Class Teacher for {sections.find(s => s.id === selectedSection)?.name}</h3>
                          {classTeacher && teacher ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <FiUsers className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{teacher.firstname} {teacher.lastname}</p>
                                  <p className="text-sm text-gray-500">{teacher.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteClassTeacher(selectedSection)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove class teacher"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={handleAssignClassTeacher} className="flex items-center space-x-3">
                              <select
                                value={selectedClassTeacherId}
                                onChange={(e) => setSelectedClassTeacherId(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                <option value="">Select Class Teacher</option>
                                {teachers.filter(t => t.isActive === 'ACTIVE' || t.isActive === 'CREATED').map((teacher) => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.firstname} {teacher.lastname}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                disabled={!selectedClassTeacherId}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiPlus className="w-4 h-4" />
                                <span>Assign Class Teacher</span>
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Subject Teacher Assignments Table */}
                {selectedSection && (
                  <>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Subject Teachers for {sections.find(s => s.id === selectedSection)?.name}</h3>
                    {subjectTeacherTenures.filter(st => st.sectionTenureId === selectedSection).length === 0 ? (
                      <p className="text-gray-500">No subject teachers assigned to this section yet.</p>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Teacher</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Workload</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectTeacherTenures
                            .filter(st => st.sectionTenureId === selectedSection)
                            .map((tenure) => {
                              const subject = subjects.find(s => s.id === tenure.classSubjectId);
                              const teacher = teachers.find(t => t.id === tenure.teacherId);
                              const teacherWorkload = teacher?.subjectTeacherTenures?.length || 0;
                              return (
                                <tr key={tenure.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <span className="font-medium text-gray-900">{subject?.name || 'Unknown'}</span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-500">
                                    {teacher ? `${teacher.firstname} ${teacher.lastname}` : 'Unknown'}
                                  </td>
                                  <td className="py-3 px-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      teacherWorkload <= 2 ? 'bg-green-100 text-green-700' :
                                      teacherWorkload <= 4 ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {teacherWorkload} {teacherWorkload === 1 ? 'subject' : 'subjects'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      onClick={() => handleDeleteSubjectTeacher(tenure.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Students</h2>
                  <button
                    onClick={() => setIsEnrollModalOpen(true)}
                    disabled={!selectedClass || !selectedSection}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Enroll Student</span>
                  </button>
                </div>

                {!selectedClass || !selectedSection ? (
                  <p className="text-gray-500">Please select both class and section to view enrolled students.</p>
                ) : (
                  <>
                    {(() => {
                      // Get ACTIVE enrollments for the selected section
                      const sectionEnrollments = enrollments.filter((e) => e.sectionTenureId === selectedSection && e.status === 'ACTIVE');
                      const enrolledStudents = students.filter((s) => sectionEnrollments.some((e) => e.studentId === s.id));

                      if (enrolledStudents.length === 0) {
                        return <p className="text-gray-500">No students enrolled in this section yet.</p>;
                      }

                      return (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Enrolled</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enrolledStudents.map((student) => {
                              const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);
                              return (
                                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 bg-green-100 rounded-lg">
                                        <FiUsers className="w-4 h-4 text-green-600" />
                                      </div>
                                      <span className="font-medium text-gray-900">
                                        {student.firstname} {student.lastname}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-500">{student.email}</td>
                                  <td className="py-3 px-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.isEnrolled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                      {student.isEnrolled ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                      {enrollment?.status || 'ACTIVE'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      onClick={() => enrollment && handleUnenrollStudent(enrollment.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Unenroll student"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>
                {!selectedClass || !selectedSection ? (
                  <p className="text-gray-500">Please select both class and section to view attendance.</p>
                ) : (
                  <p className="text-gray-500">Attendance records will be displayed here for the selected class and section.</p>
                )}
              </div>
            )}

            {activeTab === 'fees' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fees</h2>
                {!selectedClass || !selectedSection ? (
                  <p className="text-gray-500">Please select both class and section to view fees.</p>
                ) : (
                  <p className="text-gray-500">Fee records will be displayed here for the selected class and section.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Enroll Student</h3>
              <button
                onClick={() => {
                  setIsEnrollModalOpen(false);
                  setSelectedStudentId('');
                  setRollNumber('');
                  setEnrollmentStatus('ACTIVE');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a student</option>
                  {students
                    .filter((s) => s.role === 'STUDENT' && s.isActive !== 'DELETED' && !enrollments.some((e) => e.studentId === s.id))
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstname} {student.lastname} ({student.email})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number (Optional)</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter roll number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={enrollmentStatus}
                  onChange={(e) => setEnrollmentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsEnrollModalOpen(false);
                    setSelectedStudentId('');
                    setRollNumber('');
                    setEnrollmentStatus('ACTIVE');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedStudentId) {
                      handleEnrollStudent(selectedStudentId);
                    }
                  }}
                  disabled={!selectedStudentId || enrollingStudent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrollingStudent ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unenroll Student Modal */}
      {isUnenrollModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Enrollment Status</h3>
              <button
                onClick={() => {
                  setIsUnenrollModalOpen(false);
                  setUnenrollEnrollmentId('');
                  setUnenrollStatus('PROMOTED');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the new status for this student's enrollment. The enrollment record will be kept for historical tracking.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Status</label>
                <select
                  value={unenrollStatus}
                  onChange={(e) => setUnenrollStatus(e.target.value as 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PROMOTED">Promoted - Student moved to next grade</option>
                  <option value="RETAINED">Retained - Student repeating this grade</option>
                  <option value="DROPPED_OUT">Dropped Out - Student left school</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsUnenrollModalOpen(false);
                    setUnenrollEnrollmentId('');
                    setUnenrollStatus('PROMOTED');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUnenroll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Class</h3>
              <button
                onClick={() => {
                  setIsEditClassModalOpen(false);
                  setEditingClass(null);
                  setEditClassName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateClass}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditClassModalOpen(false);
                    setEditingClass(null);
                    setEditClassName('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {isEditSectionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Section</h3>
              <button
                onClick={() => {
                  setIsEditSectionModalOpen(false);
                  setEditingSection(null);
                  setEditSectionName('');
                  setEditSectionCapacity('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSection}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                  <input
                    type="text"
                    value={editSectionName}
                    onChange={(e) => setEditSectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={editSectionCapacity}
                    onChange={(e) => setEditSectionCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditSectionModalOpen(false);
                    setEditingSection(null);
                    setEditSectionName('');
                    setEditSectionCapacity('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditSubjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Subject</h3>
              <button
                onClick={() => {
                  setIsEditSubjectModalOpen(false);
                  setEditingSubject(null);
                  setEditSubjectName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditSubjectModalOpen(false);
                    setEditingSubject(null);
                    setEditSubjectName('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
