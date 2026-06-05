import { useState, useEffect } from 'react';

import { FiBookOpen, FiUsers, FiCalendar, FiGrid, FiPlus, FiTrash2, FiX, FiEdit, FiBook, FiAlertCircle, FiSearch } from 'react-icons/fi';

import axiosInstance from '../../lib/axios';

import { LuReceiptIndianRupee } from 'react-icons/lu';

import { StudentDetailsModal } from './StudentDetailsModal';
import { FeeDetailsModal } from './FeeDetailsModal';
import { FeeUpdateModal } from './FeeUpdateModal';

import BulkManagementTable, { type Column, type Action } from '../common/BulkManagementTable';

import ToastModal from '../common/ToastModal';



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

  rollNumber?: string;

  status?: string;

  fees?: any[];
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



interface AcademicYear {

  id: string;

  name: string;

  startDate?: string;

  endDate?: string;

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
  const [classTeachers, setClassTeachers] = useState<any[]>([]);

  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null);

  const [selectedClass, setSelectedClass] = useState<string>('');

  const [selectedSection, setSelectedSection] = useState<string>('');

  const [selectedClassTeacherId, setSelectedClassTeacherId] = useState<string>('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const [toastModal, setToastModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    title?: string;
    message: string;
    showConfirm: boolean;
    onConfirm?: () => void;
    confirmText?: string;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
    showConfirm: false,
  });



  // Form states

  const [newClassName, setNewClassName] = useState('');

  const [newSectionName, setNewSectionName] = useState('');

  const [newSectionCapacity, setNewSectionCapacity] = useState('');

  const [newSectionRollPrefix, setNewSectionRollPrefix] = useState('');

  const [newSubjectName, setNewSubjectName] = useState('');

  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const [enrollingStudent, setEnrollingStudent] = useState(false);

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const [tuitionMonthlyFee, setTuitionMonthlyFee] = useState('');

  const [selectedFeeType, setSelectedFeeType] = useState<'SCHOOL' | 'TUITION' | ''>('');

  const [annualFee, setAnnualFee] = useState('');

  const [examFee, setExamFee] = useState('0');

  const [miscellaneousFee, setMiscellaneousFee] = useState('0');

  const [labFee, setLabFee] = useState('0');

  const [includeInMonthlyCalculation, setIncludeInMonthlyCalculation] = useState(false);

  const [percentageOption, setPercentageOption] = useState('0');

  const [studentFees, setStudentFees] = useState<any[]>([]);

  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<any>(null);

  const [paymentMonth, setPaymentMonth] = useState('');

  const [paymentAmount, setPaymentAmount] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const [paymentNotes, setPaymentNotes] = useState('');

  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);

  const [unenrollEnrollmentId, setUnenrollEnrollmentId] = useState('');

  const [unenrollStatus, setUnenrollStatus] = useState<'PAUSED' | 'WRONG_ENTRY' | 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT'>('PROMOTED');

  const [selectedEnrolledStudentIds, setSelectedEnrolledStudentIds] = useState<string[]>([]);

  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);

  const [bulkStatus, setBulkStatus] = useState<'PAUSED' | 'WRONG_ENTRY' | 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT'>('PROMOTED');

  const [isStudentDetailsModalOpen, setIsStudentDetailsModalOpen] = useState(false);

  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<any>(null);

  const [isFeeDetailsModalOpen, setIsFeeDetailsModalOpen] = useState(false);

  const [selectedStudentFeeId, setSelectedStudentFeeId] = useState<string>('');

  const [isFeeUpdateModalOpen, setIsFeeUpdateModalOpen] = useState(false);

  const [selectedStudentForFeeUpdate, setSelectedStudentForFeeUpdate] = useState<any>(null);

  const [updateFeeType, setUpdateFeeType] = useState<'SCHOOL' | 'TUITION' | ''>('');

  const [updateAnnualFee, setUpdateAnnualFee] = useState('');

  const [updateExamFee, setUpdateExamFee] = useState('0');

  const [updateMiscellaneousFee, setUpdateMiscellaneousFee] = useState('0');

  const [updateLabFee, setUpdateLabFee] = useState('0');

  const [updateIncludeInMonthlyCalculation, setUpdateIncludeInMonthlyCalculation] = useState(false);

  const [updatePercentageOption, setUpdatePercentageOption] = useState('0');

  const [updateTuitionMonthlyFee, setUpdateTuitionMonthlyFee] = useState('');

  const [isFetchingFeeData, setIsFetchingFeeData] = useState(false);

  // Store original values to check for changes

  const [originalFeeValues, setOriginalFeeValues] = useState<any>(null);

  // Modal message state

  const [updateFeeMessage, setUpdateFeeMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);



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

  const [editSectionRollPrefix, setEditSectionRollPrefix] = useState('');

  const [editSubjectName, setEditSubjectName] = useState('');



  const fetchAcademicYear = async () => {

    try {

      const response = await axiosInstance.get(`/academic-year/${yearId}`);

      setAcademicYear(response.data.body);

    } catch (error) {

      console.error('Failed to fetch academic year:', error);

    }

  };



  useEffect(() => {

    if (yearId) {

      fetchClasses();

      fetchStudents();

      fetchEnrollments();

      fetchSubjects();

      fetchAcademicYear();

    }

  }, [yearId]);



  useEffect(() => {

    if (yearId && activeTab === 'subjects') {

      fetchAvailableTeachers();
      fetchClassTeachers();

      fetchSubjectTeacherTenures();

      fetchClassTeacherTenures();

      fetchSubjects();

    }

  }, [yearId, activeTab]);



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

      const response = await axiosInstance.get('/student-enrollment', {
        params: {
          academicYearId: yearId,
          limit: 1000 // Get all enrollments for this academic year
        }
      });

      const allEnrollments = response.data.body;

      // Fetch fees for this academic year
      const feesResponse = await axiosInstance.get(`/student-fee/academic-year/${yearId}`);
      const fees = feesResponse.data.body || [];

      // Merge fees into enrollments
      const enrollmentsWithFees = allEnrollments.map((enrollment: StudentEnrollment) => {
        const studentFees = fees.filter((fee: any) => fee.student?.userId === enrollment.studentId);
        return {
          ...enrollment,
          fees: studentFees
        };
      });

      console.log(enrollmentsWithFees);
      console.log('Fees from API:', fees);
      
      setEnrollments(enrollmentsWithFees);

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

  const fetchClassTeachers = async () => {
    try {
      const response = await axiosInstance.get('/management-tenure/type/CLASS_TEACHER');
      setClassTeachers(response.data.body || []);
    } catch (error) {
      console.error('Failed to fetch class teachers:', error);
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

    } catch (error: any) {

      const errorMsg = error.response?.data?.message || 'Failed to create class';

      setError(errorMsg);

      setTimeout(() => setError(null), 3000);

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

        rollNoPrefix: newSectionRollPrefix || undefined,

      });

      setNewSectionName('');

      setNewSectionCapacity('');

      setNewSectionRollPrefix('');

      fetchSections(selectedClass);

    } catch (error: any) {

      const errorMsg = error.response?.data?.message || 'Failed to create section';

      setError(errorMsg);

      setTimeout(() => setError(null), 3000);

    }

  };



  const handleEnrollStudents = async () => {

    if (!selectedSection || selectedStudentIds.length === 0) return;



    try {

      setEnrollingStudent(true);

      setEnrollmentError(null);



      // Prepare fee data if fee type is selected

      let feeData = null;

      if (selectedFeeType === 'SCHOOL') {

        const annualAmount = annualFee ? parseInt(annualFee) : 0;

        const examAmount = examFee ? parseInt(examFee) : 0;

        const miscAmount = miscellaneousFee ? parseInt(miscellaneousFee) : 0;

        const labAmount = labFee ? parseInt(labFee) : 0;

        const discount = percentageOption ? parseInt(percentageOption) : 0;



        let totalSchoolFee = annualAmount + examAmount + miscAmount + labAmount;

        totalSchoolFee = totalSchoolFee - Math.floor(totalSchoolFee * (discount / 100));



        let monthlySchoolFee;

        if (includeInMonthlyCalculation) {

          monthlySchoolFee = totalSchoolFee > 0 ? Math.ceil(totalSchoolFee / 12) : 0;

        } else {

          const annualWithDiscount = annualAmount - Math.floor(annualAmount * (discount / 100));

          monthlySchoolFee = annualWithDiscount > 0 ? Math.ceil(annualWithDiscount / 12) : 0;

        }



        feeData = {

          monthlyAmount: monthlySchoolFee,

          totalAmount: totalSchoolFee,

          annualFee: annualAmount,

          examFee: examAmount,

          miscellaneousFee: miscAmount,

          labFee: labAmount,

          includeInMonthlyCalculation: includeInMonthlyCalculation,

          discountPercentage: discount,

        };

      } else if (selectedFeeType === 'TUITION' && tuitionMonthlyFee) {
        const monthlyAmount = parseInt(tuitionMonthlyFee);
        const enrollmentDate = new Date();
        const academicYearStart = academicYear?.startDate ? new Date(academicYear.startDate) : new Date();
        const academicYearEnd = academicYear?.endDate ? new Date(academicYear.endDate) : new Date();

        // Calculate day-to-day months from enrollment date
        let currentDate = new Date(enrollmentDate);
        let totalMonths = 0;
        let extraDays = 0;

        while (currentDate < academicYearEnd) {
          const nextMonthDate = new Date(currentDate);
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

          if (nextMonthDate <= academicYearEnd) {
            totalMonths++;
            currentDate = nextMonthDate;
          } else {
            // Calculate extra days beyond academic year end
            extraDays = Math.ceil((academicYearEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            break;
          }
        }

        // Calculate amounts
        const fullMonthsAmount = monthlyAmount * totalMonths;
        const extraDaysAmount = extraDays > 0 ? Math.round((extraDays / 30) * monthlyAmount) : 0;
        const totalAmount = fullMonthsAmount + extraDaysAmount;

        feeData = {
          monthlyAmount: monthlyAmount,
          totalAmount: totalAmount,
          enrollmentDate: enrollmentDate.toISOString(),
          academicYearStart: academicYearStart.toISOString(),
          academicYearEnd: academicYearEnd.toISOString(),
        };

        // Don't send totalAmount to backend for TUITION fees - it will be calculated dynamically
        delete feeData.totalAmount;
      }



      // Single API call for batch enrollment with fees

      const response = await axiosInstance.post('/student-enrollment/batch', {

        studentIds: selectedStudentIds,

        academicYearId: yearId,

        sectionTenureId: selectedSection,

        feeType: selectedFeeType || undefined,

        feeData: feeData || undefined,

      });



      const result = response.data.body;

      

      if (result.failed.length > 0) {

        setEnrollmentError(`${result.successful.length} students enrolled successfully. ${result.failed.length} failed.`);

      }



      fetchEnrollments(); // Refresh enrollments after enrolling

      setIsEnrollModalOpen(false);

      setSelectedStudentIds([]);

      setStudentSearchQuery('');

      setEnrollmentError(null);

      setSelectedFeeType('');

      setAnnualFee('');

      setExamFee('0');

      setMiscellaneousFee('0');

      setLabFee('0');

      setIncludeInMonthlyCalculation(false);

      setPercentageOption('0');

      setTuitionMonthlyFee('');

      setSuccess(`${selectedStudentIds.length} student(s) enrolled successfully`);

      setTimeout(() => setSuccess(null), 3000);

    } catch (error: any) {

      console.error('Failed to enroll students:', error);

      const errorMessage = error.response?.data?.message || 'Failed to enroll students';

      setEnrollmentError(errorMessage);

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



  const handleOpenStudentDetails = (student: any, enrollment: any) => {

    setSelectedStudentForDetails({ student, enrollment });

    setIsStudentDetailsModalOpen(true);

  };



  const handleOpenUpdateFeeModal = async (student: any) => {

    setSelectedStudentForFeeUpdate(student);

    setIsFetchingFeeData(true);

    setIsFeeUpdateModalOpen(true);

    setUpdateFeeMessage(null);



    // Reset form first

    setUpdateFeeType('');

    setUpdateAnnualFee('');

    setUpdateExamFee('0');

    setUpdateMiscellaneousFee('0');

    setUpdateLabFee('0');

    setUpdateIncludeInMonthlyCalculation(false);

    setUpdatePercentageOption('0');

    setUpdateTuitionMonthlyFee('');

    setOriginalFeeValues(null);



    try {

      // Get the student's ACTIVE enrollment for the current academic year

      const activeEnrollment = enrollments.find(

        (e) => e.studentId === student.id && e.academicYearId === yearId && e.status === 'ACTIVE'

      );



      if (!activeEnrollment) {

        console.log('No active enrollment found for student');

        setIsFetchingFeeData(false);

        return;

      }



      // Fetch fee details for this specific student

      const response = await axiosInstance.get(`/student-fee/student/${student.id}`);

      const fees = response.data.body;



      if (fees && fees.length > 0) {

        // Get the most recent fee for the current academic year (to handle duplicates temporarily)

        // In the future, we should filter by enrollment ID or add enrollmentId to fee records

        const academicYearFees = fees.filter((f: any) => f.academicYearId === yearId);

        const studentFee = academicYearFees[academicYearFees.length - 1]; // Get the most recent one



        console.log('Student fee data:', studentFee);

        console.log('Fee type:', studentFee.feeType);

        console.log('Active enrollment:', activeEnrollment);



        // Set fee type

        setUpdateFeeType(studentFee.feeType || '');



        // Store original values for comparison

        const originalValues = {

          feeType: studentFee.feeType,

          annualFee: studentFee.annualFee?.toString() || '',

          examFee: studentFee.examFee?.toString() || '0',

          miscellaneousFee: studentFee.miscellaneousFee?.toString() || '0',

          labFee: studentFee.labFee?.toString() || '0',

          includeInMonthlyCalculation: studentFee.includeInMonthlyCalculation || false,

          discountPercentage: studentFee.discountPercentage?.toString() || '0',

          monthlyAmount: studentFee.monthlyAmount?.toString() || '',

          totalAmount: studentFee.totalAmount?.toString() || '',

        };

        setOriginalFeeValues(originalValues);



        if (studentFee.feeType === 'SCHOOL') {

          // Populate form with individual fee components for SCHOOL

          setUpdateAnnualFee(studentFee.annualFee?.toString() || '');

          setUpdateExamFee(studentFee.examFee?.toString() || '0');

          setUpdateMiscellaneousFee(studentFee.miscellaneousFee?.toString() || '0');

          setUpdateLabFee(studentFee.labFee?.toString() || '0');

          setUpdateIncludeInMonthlyCalculation(studentFee.includeInMonthlyCalculation || false);

          setUpdatePercentageOption(studentFee.discountPercentage?.toString() || '0');

          setUpdateTuitionMonthlyFee('');

        } else if (studentFee.feeType === 'TUITION') {

          // Populate form with monthly fee for TUITION

          setUpdateTuitionMonthlyFee(studentFee.monthlyAmount?.toString() || '');

          setUpdateAnnualFee('');

          setUpdateExamFee('0');

          setUpdateMiscellaneousFee('0');

          setUpdateLabFee('0');

          setUpdateIncludeInMonthlyCalculation(false);

          setUpdatePercentageOption('0');

        }

      }

    } catch (error) {

      console.error('Failed to fetch student fee:', error);

      // Reset form on error

      setUpdateFeeType('');

      setUpdateAnnualFee('');

      setUpdateExamFee('0');

      setUpdateMiscellaneousFee('0');

      setUpdateLabFee('0');

      setUpdateIncludeInMonthlyCalculation(false);

      setUpdatePercentageOption('0');

      setUpdateTuitionMonthlyFee('');

      setOriginalFeeValues(null);

    } finally {

      setIsFetchingFeeData(false);

    }

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



  const handleBulkStatusUpdate = async () => {

    try {

      const sectionEnrollments = enrollments.filter(

        (e) => e.sectionTenureId === selectedSection && e.status === 'ACTIVE'

      );



      const enrollmentIds = sectionEnrollments

        .filter((e) => selectedEnrolledStudentIds.includes(e.studentId))

        .map((e) => e.id);



      await Promise.all(

        enrollmentIds.map((id) =>

          axiosInstance.patch(`/student-enrollment/${id}`, {

            status: bulkStatus,

          })

        )

      );



      setSuccess(`${selectedEnrolledStudentIds.length} students updated to ${bulkStatus}`);

      setTimeout(() => setSuccess(null), 3000);

      setIsBulkStatusModalOpen(false);

      setSelectedEnrolledStudentIds([]);

      setBulkStatus('PROMOTED');

      fetchEnrollments();

    } catch (error) {

      console.error('Failed to bulk update enrollment status:', error);

      setError('Failed to bulk update enrollment status');

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

    setEditSectionRollPrefix((section as any).rollNoPrefix || '');

    setIsEditSectionModalOpen(true);

  };



  const handleUpdateSection = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!editingSection || !editSectionName.trim() || !editSectionCapacity.trim()) return;



    try {

      await axiosInstance.patch(`/section-tenure/${editingSection.id}`, {

        name: editSectionName,

        capacity: parseInt(editSectionCapacity),

        rollNoPrefix: editSectionRollPrefix || undefined,

      });

      setIsEditSectionModalOpen(false);

      setEditingSection(null);

      setEditSectionName('');

      setEditSectionCapacity('');

      setEditSectionRollPrefix('');

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
      fetchClassTeachers();

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
      fetchClassTeachers();

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

    setToastModal({
      isOpen: true,
      type: 'confirm',
      title: 'Remove Subject Teacher',
      message: 'Are you sure you want to remove this subject teacher assignment?',
      showConfirm: true,
      onConfirm: async () => {
        try {
          setError(null);
          await axiosInstance.delete(`/section-management/subject-teacher/${tenureId}`);
          setSuccess('Subject teacher removed successfully!');
          setTimeout(() => setSuccess(null), 3000);
          fetchSubjectTeacherTenures();
          fetchAvailableTeachers();
          fetchClassTeachers();
          setToastModal({ isOpen: false, type: 'info', message: '', showConfirm: false });
        } catch (error: any) {
          console.error('Failed to remove subject teacher:', error);
          setError(error.response?.data?.message || 'Failed to remove subject teacher');
          setToastModal({ isOpen: false, type: 'info', message: '', showConfirm: false });
        }
      },
    });
    return;
  };



  const handleDeleteClassTeacher = async (sectionId: string) => {
    setToastModal({
      isOpen: true,
      type: 'confirm',
      title: 'Remove Class Teacher',
      message: 'Are you sure you want to remove the class teacher?',
      showConfirm: true,
      onConfirm: async () => {
        try {
          setError(null);
          await axiosInstance.delete(`/section-management/class-teacher/${sectionId}`);
          setSuccess('Class teacher removed successfully!');
          setTimeout(() => setSuccess(null), 3000);
          fetchClassTeacherTenures();
          fetchAvailableTeachers();
          fetchClassTeachers();
          setToastModal({ isOpen: false, type: 'info', message: '', showConfirm: false });
        } catch (error: any) {
          console.error('Failed to remove class teacher:', error);
          setError(error.response?.data?.message || 'Failed to remove class teacher');
          setToastModal({ isOpen: false, type: 'info', message: '', showConfirm: false });
        }
      },
    });
    return;
  };



  const tabs = [

    { id: 'classes' as TabType, label: 'Classes', icon: <FiBookOpen className="w-5 h-5" /> },

    { id: 'sections' as TabType, label: 'Sections', icon: <FiGrid className="w-5 h-5" /> },

    { id: 'subjects' as TabType, label: 'Subjects', icon: <FiBook className="w-5 h-5" /> },

    { id: 'students' as TabType, label: 'Students', icon: <FiUsers className="w-5 h-5" /> },

    { id: 'attendance' as TabType, label: 'Attendance', icon: <FiCalendar className="w-5 h-5" /> },

    { id: 'fees' as TabType, label: 'Fees', icon: <LuReceiptIndianRupee className="w-5 h-5" /> },

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

                      required

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

                    <div className="space-y-3">

                      <div className="flex items-center space-x-3">

                        <input

                          type="text"

                          value={newSectionName}

                          onChange={(e) => setNewSectionName(e.target.value)}

                          placeholder="Section name (e.g., A)"

                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                          required

                        />

                        <input

                          type="number"

                          value={newSectionCapacity}

                          onChange={(e) => setNewSectionCapacity(e.target.value)}

                          placeholder="Capacity"

                          min="1"

                          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                          required

                        />

                        <input

                          type="text"

                          value={newSectionRollPrefix}

                          onChange={(e) => setNewSectionRollPrefix(e.target.value.toUpperCase())}

                          placeholder="Roll prefix (e.g., A-, B-)"

                          pattern="^[A-Z]{1,3}-$"

                          title="1-3 uppercase letters followed by hyphen"

                          className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                        />

                        <button

                          type="submit"

                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

                        >

                          <FiPlus className="w-4 h-4" />

                          <span>Add Section</span>

                        </button>

                      </div>

                      <p className="text-xs text-gray-500">

                        Roll prefix will be used to auto-generate student roll numbers for this section (e.g., A-01, A-02)

                      </p>

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

                            {subjects
                              .filter(s => s.classTenureId === selectedClass)
                              .filter(s => selectedSubjectId === s.id || !subjectTeacherTenures.some(st => st.classSubjectId === s.id && st.sectionTenureId === selectedSection))
                              .map((subject) => (

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

                                {teacher.firstname} {teacher.lastname} (Teacher)

                              </option>

                            ))}

                            {classTeachers.map((teacher) => (

                              <option key={teacher.id} value={teacher.id}>

                                {teacher.firstname} {teacher.lastname} (Class Teacher)

                              </option>

                            ))}

                          </select>

                        </div>

                        <div className="flex items-end space-x-2">

                          <button

                            type="submit"

                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

                          >

                            <FiPlus className="w-4 h-4" />

                            <span>Assign</span>

                          </button>

                          <button

                            type="button"

                            onClick={() => {
                              setSelectedSubjectId('');
                              setSelectedTeacherId('');
                            }}

                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"

                          >

                            <FiX className="w-4 h-4" />

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

                      const teacher = classTeacher ? classTeachers.find(t => t.id === classTeacher.teacherId) : null;

                      

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

                              <div className="flex items-center space-x-2">

                                <button

                                  onClick={() => setSelectedClassTeacherId(classTeacher.teacherId)}

                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                                  title="Edit class teacher"

                                >

                                  <FiEdit className="w-4 h-4" />

                                </button>

                                <button

                                  onClick={() => handleDeleteClassTeacher(selectedSection)}

                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

                                  title="Remove class teacher"

                                >

                                  <FiTrash2 className="w-4 h-4" />

                                </button>

                              </div>

                            </div>

                          ) : (

                            <form onSubmit={handleAssignClassTeacher} className="flex items-center space-x-3">

                              <select

                                value={selectedClassTeacherId}

                                onChange={(e) => setSelectedClassTeacherId(e.target.value)}

                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                              >

                                <option value="">Select Class Teacher</option>

                                {classTeachers.map((teacher) => (

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

                    <h3 className="text-md font-semibold text-gray-900 mb-3">Subject Teachers for {classes.find(c => c.id === selectedClass)?.name} {sections.find(s => s.id === selectedSection)?.name}</h3>

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

                              const teacher = teachers.find(t => t.id === tenure.teacherId) || classTeachers.find(t => t.id === tenure.teacherId);

                              const teacherWorkload = subjectTeacherTenures.filter(st => st.teacherId === tenure.teacherId).length;

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

                                    <div className="flex items-center justify-end space-x-2">

                                      <button

                                        onClick={() => {
                                          setSelectedSubjectId(tenure.classSubjectId);
                                          setSelectedTeacherId(tenure.teacherId);
                                        }}

                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                                        title="Edit teacher"

                                      >

                                        <FiEdit className="w-4 h-4" />

                                      </button>

                                      <button

                                        onClick={() => handleDeleteSubjectTeacher(tenure.id)}

                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

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

                  </>

                )}

              </div>

            )}



            {activeTab === 'students' && (

              <div>

                <div className="flex items-center justify-between mb-4">

                  <h2 className="text-lg font-semibold text-gray-900">Students</h2>

                  <div className="flex items-center space-x-3">

                    {selectedEnrolledStudentIds.length > 0 && (

                      <button

                        onClick={() => setIsBulkStatusModalOpen(true)}

                        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"

                      >

                        <span>Update Status ({selectedEnrolledStudentIds.length})</span>

                      </button>

                    )}

                    <button

                      onClick={() => setIsEnrollModalOpen(true)}

                      disabled={!selectedClass || !selectedSection}

                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                    >

                      <FiPlus className="w-4 h-4" />

                      <span>Enroll Student</span>

                    </button>

                  </div>

                </div>



                {!selectedClass || !selectedSection ? (

                  <p className="text-gray-500">Please select both class and section to view enrolled students.</p>

                ) : (

                  (() => {

                    // Get ACTIVE enrollments for the selected section

                    const sectionEnrollments = enrollments.filter((e) => e.sectionTenureId === selectedSection && e.status === 'ACTIVE');

                    const enrolledStudents = students.filter((s) => sectionEnrollments.some((e) => e.studentId === s.id));



                    const enrolledStudentColumns: Column<Student & { enrollment?: StudentEnrollment }>[] = [

                      {

                        key: 'rollNumber',

                        label: 'Roll Number',

                        render: (student) => {

                          const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                          return enrollment?.rollNumber ? (

                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">

                              {enrollment.rollNumber}

                            </span>

                          ) : (

                            <span className="text-sm text-gray-400">N/A</span>

                          );

                        },

                      },

                      {

                        key: 'name',

                        label: 'Name',

                        render: (student) => (

                          <span className="font-medium text-gray-900">

                            {student.firstname} {student.lastname}

                          </span>

                        ),

                      },

                      {

                        key: 'email',

                        label: 'Email',

                        render: (student) => <span className="text-sm text-gray-500">{student.email}</span>,

                      },

                      {

                        key: 'isEnrolled',

                        label: 'Enrolled',

                        render: (student) => (

                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.isEnrolled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>

                            {student.isEnrolled ? 'Yes' : 'No'}

                          </span>

                        ),

                      },

                    ];



                    const enrolledStudentRowActions: Action<Student & { enrollment?: StudentEnrollment }>[] = [

                      {

                        label: 'Unenroll',

                        icon: <FiTrash2 className="w-4 h-4" />,

                        onClick: (student) => {

                          const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                          if (enrollment) {

                            handleUnenrollStudent(enrollment.id);

                          }

                        },

                        danger: true,

                      },

                    ];



                    const handleDeleteEnrolledSelected = async (selectedIds: string[]) => {

                      if (!confirm(`Are you sure you want to update status for ${selectedIds.length} student(s)?`)) return;

                      setSelectedEnrolledStudentIds(selectedIds);

                      setIsBulkStatusModalOpen(true);

                    };



                    const handleExportEnrolled = () => {

                      console.log('Export enrolled students functionality to be implemented');

                    };



                    const handleFilterEnrolled = () => {

                      console.log('Filter enrolled students functionality to be implemented');

                    };



                    return (

                      <BulkManagementTable

                        data={enrolledStudents.map(s => ({ ...s, enrollment: enrollments.find((e) => e.studentId === s.id && e.sectionTenureId === selectedSection) }))}

                        columns={enrolledStudentColumns}

                        rowKey="id"

                        statusColumn={{

                          key: 'enrollment',

                          getStatus: (student) => {

                            const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                            return { label: enrollment?.status || 'ACTIVE', color: 'bg-green-100 text-green-700' };

                          },

                        }}

                        rowActions={enrolledStudentRowActions}

                        onRowClick={(student) => {

                          const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                          handleOpenStudentDetails(student, enrollment);

                        }}

                        loading={false}

                        error={null}

                        emptyMessage="No students enrolled in this section yet."

                        onDeleteSelected={handleDeleteEnrolledSelected}

                        onExport={handleExportEnrolled}

                        onFilter={handleFilterEnrolled}

                        searchPlaceholder="Search enrolled students..."

                        searchValue=""

                        onSearchChange={() => {}}

                      />

                    );

                  })()

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

                <div className="flex items-center justify-between mb-4">

                  <h2 className="text-lg font-semibold text-gray-900">Students</h2>

                </div>



                {!selectedClass || !selectedSection ? (

                  <p className="text-gray-500">Please select both class and section to view enrolled students.</p>

                ) : (

                  (() => {

                    // Get ACTIVE enrollments for the selected section

                    const sectionEnrollments = enrollments.filter((e) => e.sectionTenureId === selectedSection && e.status === 'ACTIVE');

                    const enrolledStudents = students.filter((s) => sectionEnrollments.some((e) => e.studentId === s.id));



                    const enrolledStudentColumns: Column<Student & { enrollment?: StudentEnrollment }>[] = [

                      {

                        key: 'rollNumber',

                        label: 'Roll Number',

                        render: (student) => {

                          const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                          return enrollment?.rollNumber ? (

                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">

                              {enrollment.rollNumber}

                            </span>

                          ) : (

                            <span className="text-sm text-gray-400">N/A</span>

                          );

                        },

                      },

                      {

                        key: 'name',

                        label: 'Name',

                        render: (student) => (

                          <span className="font-medium text-gray-900">

                            {student.firstname} {student.lastname}

                          </span>

                        ),

                      },

                      {

                        key: 'email',

                        label: 'Email',

                        render: (student) => <span className="text-sm text-gray-500">{student.email}</span>,

                      },

                      {

                        key: 'feeType',

                        label: 'Fee Type',

                        render: (student) => {

                          if (!student || !student.id) {

                            return <span className="text-sm text-gray-400">N/A</span>;

                          }

                          const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                          const fees = (enrollment as any)?.fees || [];

                          const tuitionFee = fees.find((f: any) => f && f.feeType === 'TUITION');

                          const schoolFee = fees.find((f: any) => f && f.feeType === 'SCHOOL');

                          

                          if (tuitionFee) {

                            return (

                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700`}>

                                Tuition

                              </span>

                            );

                          } else if (schoolFee) {

                            return (

                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700`}>

                                School

                              </span>

                            );

                          } else {

                            return (

                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>

                                N/A

                              </span>

                            );

                          }

                        },

                      },

                      {

                        key: 'fees',

                        label: 'Fees',

                        render: (student) => {

                          if (!student || !student.id) {

                            return <span className="text-sm text-gray-400">N/A</span>;

                          }

                          const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                          const fees = (enrollment as any)?.fees || [];

                          const tuitionFee = fees.find((f: any) => f && f.feeType === 'TUITION');

                          const schoolFee = fees.find((f: any) => f && f.feeType === 'SCHOOL');

                          

                          if (tuitionFee) {

                            return <span className="text-sm font-medium text-gray-900">₹{Number(tuitionFee.monthlyAmount || 0).toLocaleString()}/mo</span>;

                          } else if (schoolFee) {

                            return <span className="text-sm font-medium text-gray-900">₹{Number(schoolFee.totalAmount || 0).toLocaleString()}</span>;

                          } else {

                            return <span className="text-sm text-gray-400">No Fees</span>;

                          }

                        },

                      },

                    ];



                    const enrolledStudentRowActions: Action<Student & { enrollment?: StudentEnrollment }>[] = [];



                    const handleDeleteEnrolledSelected = async (selectedIds: string[]) => {

                      if (!confirm(`Are you sure you want to update status for ${selectedIds.length} student(s)?`)) return;

                      setSelectedEnrolledStudentIds(selectedIds);

                      setIsBulkStatusModalOpen(true);

                    };



                    const handleExportEnrolled = () => {

                      console.log('Export enrolled students functionality to be implemented');

                    };



                    const handleFilterEnrolled = () => {

                      console.log('Filter enrolled students functionality to be implemented');

                    };



                    return (

                      <BulkManagementTable

                        data={enrolledStudents.map(s => ({ ...s, enrollment: enrollments.find((e) => e && e.studentId === s.id && e.sectionTenureId === selectedSection) || null }))}

                        columns={enrolledStudentColumns}

                        rowKey="id"

                        onRowClick={(student) => {

                          const enrollment = enrollments.find((e) => e.studentId === student.id && e.sectionTenureId === selectedSection);

                          const fees = (enrollment as any)?.fees || [];

                          const tuitionFee = fees.find((f: any) => f && f.feeType === 'TUITION');

                          const schoolFee = fees.find((f: any) => f && f.feeType === 'SCHOOL');

                          

                          if (tuitionFee) {

                            setSelectedStudentFeeId(tuitionFee.id);

                            setSelectedStudentForDetails({ student, enrollment, feeType: 'TUITION' });

                            setIsFeeDetailsModalOpen(true);

                          } else if (schoolFee) {

                            setSelectedStudentFeeId(schoolFee.id);

                            setSelectedStudentForDetails({ student, enrollment, feeType: 'SCHOOL' });

                            setIsFeeDetailsModalOpen(true);

                          }

                        }}

                        loading={false}

                        error={null}

                        emptyMessage="No students enrolled in this section yet."

                        onDeleteSelected={handleDeleteEnrolledSelected}

                        onExport={handleExportEnrolled}

                        onFilter={handleFilterEnrolled}

                        searchPlaceholder="Search enrolled students..."

                        searchValue=""

                        onSearchChange={() => {}}

                      />

                    );

                  })()

                )}

              </div>

            )}

          </div>

        )}

      </div>



      {/* Enroll Student Modal */}

      {isEnrollModalOpen && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between p-4 border-b border-gray-200">

              <h3 className="text-lg font-semibold text-gray-900">Enroll Students</h3>

              <button

                type="button"

                onClick={() => {

                  setIsEnrollModalOpen(false);

                  setSelectedStudentIds([]);

                  setStudentSearchQuery('');

                  setEnrollmentError(null);

                  setSelectedFeeType('');

                  setAnnualFee('');

                  setExamFee('0');

                  setMiscellaneousFee('0');

                  setLabFee('0');

                  setIncludeInMonthlyCalculation(false);

                  setPercentageOption('0');

                  setTuitionMonthlyFee('');

                }}

                className="text-gray-400 hover:text-gray-600"

              >

                <FiX className="w-5 h-5" />

              </button>

            </div>



            {enrollmentError && (

              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">

                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />

                <p className="text-sm text-red-700">{enrollmentError}</p>

              </div>

            )}



            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Select Students</label>

                

                {/* Search Bar */}

                <div className="relative mb-3">

                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                  <input

                    type="text"

                    value={studentSearchQuery}

                    onChange={(e) => setStudentSearchQuery(e.target.value)}

                    placeholder="Search by name, admission no, or email..."

                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                  />

                </div>



                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">

                  {students

                    .filter((s) => {

                      // Filter by role and active status

                      if (s.role !== 'STUDENT' || s.isActive === 'DELETED') {

                        return false;

                      }



                      // Filter by isEnrolled flag - only show students who are not enrolled anywhere

                      // OR show students who are enrolled but have PAUSED or WRONG_ENTRY status in this academic year

                      if (s.isEnrolled) {

                        // Student is enrolled somewhere, check if they have PAUSED or WRONG_ENTRY in this academic year

                        const studentEnrollment = enrollments.find((e) => e.studentId === s.id && e.academicYearId === yearId);

                        const allowedStatuses = ['PAUSED', 'WRONG_ENTRY'];

                        

                        if (!studentEnrollment || !allowedStatuses.includes(studentEnrollment.status || '')) {

                          return false;

                        }

                      }



                      // Check if student has enrollment in this academic year

                      const studentEnrollment = enrollments.find((e) => e.studentId === s.id && e.academicYearId === yearId);



                      // If enrolled in this academic year, only show if status is PAUSED or WRONG_ENTRY

                      // Exclude: ACTIVE, PROMOTED, RETAINED, DROPPED_OUT

                      const allowedStatuses = ['PAUSED', 'WRONG_ENTRY'];

                      if (studentEnrollment && !allowedStatuses.includes(studentEnrollment.status || '')) {

                        return false;

                      }



                      // Filter by search query

                      if (studentSearchQuery.trim()) {

                        const query = studentSearchQuery.toLowerCase();

                        const fullName = `${s.firstname} ${s.lastname}`.toLowerCase();

                        const admissionNo = ((s as any).student?.admissionNo || '').toLowerCase();

                        const email = s.email.toLowerCase();



                        return fullName.includes(query) || admissionNo.includes(query) || email.includes(query);

                      }



                      return true;

                    })

                    .map((student) => (

                      <label

                        key={student.id}

                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"

                      >

                        <input

                          type="checkbox"

                          checked={selectedStudentIds.includes(student.id)}

                          onChange={(e) => {

                            if (e.target.checked) {

                              setSelectedStudentIds([...selectedStudentIds, student.id]);

                            } else {

                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));

                            }

                          }}

                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"

                        />

                        <div className="ml-3 flex-1">

                          <p className="text-sm font-medium text-gray-900">

                            {student.firstname} {student.lastname}

                          </p>

                          <p className="text-xs text-gray-500">

                            Admission No: {(student as any).student?.admissionNo || 'N/A'} • {student.email}

                          </p>

                        </div>

                      </label>

                    ))}

                  {students.filter((s) => {

                    // Filter by role and active status

                    if (s.role !== 'STUDENT' || s.isActive === 'DELETED') {

                      return false;

                    }



                    // Filter by isEnrolled flag

                    if (s.isEnrolled) {

                      const studentEnrollment = enrollments.find((e) => e.studentId === s.id && e.academicYearId === yearId);

                      const allowedStatuses = ['PAUSED', 'WRONG_ENTRY'];

                      

                      if (!studentEnrollment || !allowedStatuses.includes(studentEnrollment.status || '')) {

                        return false;

                      }

                    }



                    // Check if student has enrollment in this academic year

                    const studentEnrollment = enrollments.find((e) => e.studentId === s.id && e.academicYearId === yearId);



                    // If enrolled in this academic year, only show if status is PAUSED or WRONG_ENTRY

                    const allowedStatuses = ['PAUSED', 'WRONG_ENTRY'];

                    return !studentEnrollment || allowedStatuses.includes(studentEnrollment.status || '');

                  }).length === 0 && (

                    <p className="px-4 py-8 text-center text-gray-500 text-sm">No students available for enrollment</p>

                  )}

                </div>

                {selectedStudentIds.length > 0 && (

                  <p className="mt-2 text-sm text-blue-600">

                    {selectedStudentIds.length} student(s) selected

                  </p>

                )}

              </div>



              {/* Fee Inputs */}

              <div className="border-t border-gray-200 pt-4">

                <h4 className="text-sm font-medium text-gray-700 mb-3">Fee Details</h4>

                <div className="space-y-3">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>

                    <select

                      value={selectedFeeType}

                      onChange={(e) => setSelectedFeeType(e.target.value as 'SCHOOL' | 'TUITION' | '')}

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    >

                      <option value="">Select Fee Type</option>

                      <option value="SCHOOL">School</option>

                      <option value="TUITION">Tuition</option>

                    </select>

                  </div>



                  {selectedFeeType === 'SCHOOL' && (

                    <>

                      <div className="grid grid-cols-2 gap-3">

                        <div>

                          <label className="block text-xs font-medium text-gray-700 mb-1">Annual Fees (₹)</label>

                          <input

                            type="number"

                            value={annualFee}

                            onChange={(e) => setAnnualFee(e.target.value)}

                            placeholder="20000"

                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                          />

                        </div>

                        <div>

                          <label className="block text-xs font-medium text-gray-700 mb-1">Exam Fees (₹)</label>

                          <input

                            type="number"

                            value={examFee}

                            onChange={(e) => setExamFee(e.target.value)}

                            placeholder="5000"

                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                          />

                        </div>

                        <div>

                          <label className="block text-xs font-medium text-gray-700 mb-1">Miscellaneous (₹)</label>

                          <input

                            type="number"

                            value={miscellaneousFee}

                            onChange={(e) => setMiscellaneousFee(e.target.value)}

                            placeholder="1000"

                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                          />

                        </div>

                        <div>

                          <label className="block text-xs font-medium text-gray-700 mb-1">Lab Fees (₹)</label>

                          <input

                            type="number"

                            value={labFee}

                            onChange={(e) => setLabFee(e.target.value)}

                            placeholder="2000"

                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                          />

                        </div>

                        <div className="col-span-2 pt-2 border-t border-gray-200">

                          {(() => {

                            const annualAmount = annualFee ? parseInt(annualFee) : 0;

                            const examAmount = examFee ? parseInt(examFee) : 0;

                            const miscAmount = miscellaneousFee ? parseInt(miscellaneousFee) : 0;

                            const labAmount = labFee ? parseInt(labFee) : 0;

                            const discount = percentageOption ? parseInt(percentageOption) : 0;



                            let total, monthly;



                            if (includeInMonthlyCalculation) {

                              // Include all fees in monthly calculation

                              total = annualAmount + examAmount + miscAmount + labAmount;

                              // Apply discount

                              total = total - Math.floor(total * (discount / 100));

                              monthly = total > 0 ? Math.ceil(total / 12) : 0;

                            } else {

                              // Only annual fee in monthly, others are one-time

                              total = annualAmount + examAmount + miscAmount + labAmount;

                              // Apply discount

                              total = total - Math.floor(total * (discount / 100));

                              monthly = annualAmount > 0 ? Math.ceil((annualAmount - Math.floor(annualAmount * (discount / 100))) / 12) : 0;

                            }



                            return (

                              <div className="flex justify-between items-center">

                                <p className="text-sm font-medium text-gray-700">

                                  Total: ₹{total.toLocaleString()}

                                </p>

                                <p className="text-xs text-gray-500">Monthly: ₹{monthly.toLocaleString()}</p>

                              </div>

                            );

                          })()}

                        </div>

                      </div>



                      <div className="flex items-center gap-4 pt-2">

                        <div className="flex items-center gap-2">

                          <input

                            type="checkbox"

                            id="includeMonthly"

                            checked={includeInMonthlyCalculation}

                            onChange={(e) => setIncludeInMonthlyCalculation(e.target.checked)}

                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"

                          />

                          <label htmlFor="includeMonthly" className="text-sm text-gray-700">

                            Include all fees in monthly calculation

                          </label>

                        </div>



                        <div className="flex items-center gap-2">

                          <label className="text-sm text-gray-700">Discount (%):</label>

                          <input

                            type="number"

                            value={percentageOption}

                            onChange={(e) => setPercentageOption(e.target.value)}

                            placeholder="0"

                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                          />

                        </div>

                      </div>

                    </>

                  )}



                  {selectedFeeType === 'TUITION' && (

                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-1">Tuition Monthly Fee (₹)</label>

                      <input

                        type="number"

                        value={tuitionMonthlyFee}

                        onChange={(e) => setTuitionMonthlyFee(e.target.value)}

                        placeholder="e.g., 3000"

                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                      />

                      <p className="text-xs text-gray-500 mt-1">Calculated based on enrollment month</p>

                    </div>

                  )}

                </div>

              </div>

            </div>



            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">

              <button

                type="button"

                onClick={() => {

                  setIsEnrollModalOpen(false);

                  setSelectedStudentIds([]);

                  setStudentSearchQuery('');

                  setEnrollmentError(null);

                  setSelectedFeeType('');

                  setAnnualFee('');

                  setExamFee('0');

                  setMiscellaneousFee('0');

                  setLabFee('0');

                  setIncludeInMonthlyCalculation(false);

                  setPercentageOption('0');

                  setTuitionMonthlyFee('');

                }}

                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"

              >

                Cancel

              </button>

              <button

                type="button"

                onClick={handleEnrollStudents}

                disabled={selectedStudentIds.length === 0 || enrollingStudent}

                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

              >

                {enrollingStudent ? 'Enrolling...' : `Enroll ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''}`}

              </button>

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

                  onChange={(e) => setUnenrollStatus(e.target.value as 'PAUSED' | 'WRONG_ENTRY' | 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT')}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                >

                  <option value="PAUSED">Paused - Temporary pause (can re-enroll)</option>

                  <option value="WRONG_ENTRY">Wrong Entry - Incorrect section (can re-enroll)</option>

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



      {/* Bulk Status Update Modal */}

      {isBulkStatusModalOpen && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-semibold text-gray-900">Bulk Update Enrollment Status</h3>

              <button

                onClick={() => {

                  setIsBulkStatusModalOpen(false);

                  setSelectedEnrolledStudentIds([]);

                  setBulkStatus('PROMOTED');

                }}

                className="text-gray-400 hover:text-gray-600"

              >

                <FiX className="w-5 h-5" />

              </button>

            </div>

            <div className="space-y-4">

              <p className="text-sm text-gray-600">

                Update the status for {selectedEnrolledStudentIds.length} selected students. The enrollment records will be kept for historical tracking.

              </p>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Status</label>

                <select

                  value={bulkStatus}

                  onChange={(e) => setBulkStatus(e.target.value as 'PAUSED' | 'WRONG_ENTRY' | 'PROMOTED' | 'RETAINED' | 'DROPPED_OUT')}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                >

                  <option value="PAUSED">Paused - Temporary pause (can re-enroll)</option>

                  <option value="WRONG_ENTRY">Wrong Entry - Incorrect section (can re-enroll)</option>

                  <option value="PROMOTED">Promoted - Student moved to next grade</option>

                  <option value="RETAINED">Retained - Student repeating this grade</option>

                  <option value="DROPPED_OUT">Dropped Out - Student left school</option>

                </select>

              </div>

              <div className="flex justify-end space-x-3 pt-4">

                <button

                  onClick={() => {

                    setIsBulkStatusModalOpen(false);

                    setSelectedEnrolledStudentIds([]);

                    setBulkStatus('PROMOTED');

                  }}

                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"

                >

                  Cancel

                </button>

                <button

                  onClick={handleBulkStatusUpdate}

                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

                >

                  Update {selectedEnrolledStudentIds.length} Students

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* Update Fee Modal */}

      {isFeeUpdateModalOpen && selectedStudentForFeeUpdate && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between p-4 border-b border-gray-200">

              <h3 className="text-lg font-semibold text-gray-900">

                Update Fee - {selectedStudentForFeeUpdate.firstname} {selectedStudentForFeeUpdate.lastname}

              </h3>

              <button

                onClick={() => {

                  setIsFeeUpdateModalOpen(false);

                  setSelectedStudentForFeeUpdate(null);

                  setUpdateFeeType('');

                  setUpdateAnnualFee('');

                  setUpdateExamFee('0');

                  setUpdateMiscellaneousFee('0');

                  setUpdateLabFee('0');

                  setUpdateIncludeInMonthlyCalculation(false);

                  setUpdatePercentageOption('0');

                  setUpdateTuitionMonthlyFee('');

                }}

                className="text-gray-400 hover:text-gray-600"

              >

                <FiX className="w-5 h-5" />

              </button>

            </div>



            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {updateFeeMessage && (

                <div

                  className={`p-3 rounded-lg text-sm ${

                    updateFeeMessage.type === 'error'

                      ? 'bg-red-50 text-red-700 border border-red-200'

                      : updateFeeMessage.type === 'success'

                      ? 'bg-green-50 text-green-700 border border-green-200'

                      : 'bg-blue-50 text-blue-700 border border-blue-200'

                  }`}

                >

                  {updateFeeMessage.text}

                </div>

              )}

              {isFetchingFeeData ? (

                <div className="flex items-center justify-center py-8">

                  <p className="text-sm text-gray-500">Loading fee data...</p>

                </div>

              ) : (

                <>

                  {/* Fee Type Selection */}

                  <div>

                    <label className="block text-xs font-medium text-gray-700 mb-1">Fee Type</label>

                    <select

                      value={updateFeeType}

                      onChange={(e) => {

                        const newType = e.target.value as 'SCHOOL' | 'TUITION' | '';

                        setUpdateFeeType(newType);

                        // Reset fee fields when changing type

                        if (newType === 'SCHOOL') {

                          setUpdateTuitionMonthlyFee('');

                        } else if (newType === 'TUITION') {

                          setUpdateAnnualFee('');

                          setUpdateExamFee('0');

                          setUpdateMiscellaneousFee('0');

                          setUpdateLabFee('0');

                          setUpdateIncludeInMonthlyCalculation(false);

                          setUpdatePercentageOption('0');

                        }

                      }}

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                    >

                      <option value="">Select Fee Type</option>

                      <option value="SCHOOL">School Fees</option>

                      <option value="TUITION">Tuition Fees</option>

                    </select>

                  </div>



                  {updateFeeType === 'SCHOOL' ? (

                    <>

                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <label className="block text-xs font-medium text-gray-700 mb-1">Annual Fees (₹)</label>

                        <input

                          type="number"

                          value={updateAnnualFee}

                          onChange={(e) => setUpdateAnnualFee(e.target.value)}

                          placeholder="20000"

                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                        />

                      </div>

                      <div>

                        <label className="block text-xs font-medium text-gray-700 mb-1">Exam Fees (₹)</label>

                        <input

                          type="number"

                          value={updateExamFee}

                          onChange={(e) => setUpdateExamFee(e.target.value)}

                          placeholder="5000"

                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                        />

                      </div>

                      <div>

                        <label className="block text-xs font-medium text-gray-700 mb-1">Miscellaneous (₹)</label>

                        <input

                          type="number"

                          value={updateMiscellaneousFee}

                          onChange={(e) => setUpdateMiscellaneousFee(e.target.value)}

                          placeholder="1000"

                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                        />

                      </div>

                      <div>

                        <label className="block text-xs font-medium text-gray-700 mb-1">Lab Fees (₹)</label>

                        <input

                          type="number"

                          value={updateLabFee}

                          onChange={(e) => setUpdateLabFee(e.target.value)}

                          placeholder="2000"

                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                        />

                      </div>

                    </div>



                    <div className="flex items-center gap-4 pt-2">

                      <div className="flex items-center gap-2">

                        <input

                          type="checkbox"

                          id="updateIncludeMonthly"

                          checked={updateIncludeInMonthlyCalculation}

                          onChange={(e) => setUpdateIncludeInMonthlyCalculation(e.target.checked)}

                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"

                        />

                        <label htmlFor="updateIncludeMonthly" className="text-sm text-gray-700">

                          Include all fees in monthly calculation

                        </label>

                      </div>



                      <div className="flex items-center gap-2">

                        <label className="text-sm text-gray-700">Discount (%):</label>

                        <input

                          type="number"

                          value={updatePercentageOption}

                          onChange={(e) => setUpdatePercentageOption(e.target.value)}

                          placeholder="0"

                          className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                        />

                      </div>

                    </div>



                    <div className="pt-2 border-t border-gray-200">

                      {(() => {

                        const annualAmount = updateAnnualFee ? parseInt(updateAnnualFee) : 0;

                        const examAmount = updateExamFee ? parseInt(updateExamFee) : 0;

                        const miscAmount = updateMiscellaneousFee ? parseInt(updateMiscellaneousFee) : 0;

                        const labAmount = updateLabFee ? parseInt(updateLabFee) : 0;

                        const discount = updatePercentageOption ? parseInt(updatePercentageOption) : 0;



                        let total, monthly;



                        if (updateIncludeInMonthlyCalculation) {

                          total = annualAmount + examAmount + miscAmount + labAmount;

                          total = total - Math.floor(total * (discount / 100));

                          monthly = total > 0 ? Math.ceil(total / 12) : 0;

                        } else {

                          total = annualAmount + examAmount + miscAmount + labAmount;

                          total = total - Math.floor(total * (discount / 100));

                          monthly = annualAmount > 0 ? Math.ceil((annualAmount - Math.floor(annualAmount * (discount / 100))) / 12) : 0;

                        }



                        return (

                          <div className="flex justify-between items-center">

                            <p className="text-sm font-medium text-gray-700">

                              Total: ₹{total.toLocaleString()}

                            </p>

                            <p className="text-xs text-gray-500">Monthly: ₹{monthly.toLocaleString()}</p>

                          </div>

                        );

                      })()}

                    </div>

                  </>

              ) : updateFeeType === 'TUITION' ? (

                <>

                  <div>

                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Tuition Fee (₹)</label>

                    <input

                      type="number"

                      value={updateTuitionMonthlyFee}

                      onChange={(e) => setUpdateTuitionMonthlyFee(e.target.value)}

                      placeholder="3000"

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                    />

                  </div>



                  <div className="pt-2 border-t border-gray-200">

                    {(() => {

                      const monthlyAmount = updateTuitionMonthlyFee ? parseInt(updateTuitionMonthlyFee) : 0;

                      const currentMonth = new Date().getMonth();

                      const monthsRemaining = 12 - currentMonth;

                      const total = monthlyAmount > 0 ? monthlyAmount * monthsRemaining : 0;



                      return (

                        <div className="flex justify-between items-center">

                          <p className="text-sm font-medium text-gray-700">

                            Total: ₹{total.toLocaleString()}

                          </p>

                          <p className="text-xs text-gray-500">Monthly: ₹{monthlyAmount.toLocaleString()}</p>

                        </div>

                      );

                    })()}

                  </div>

                </>

              ) : (

                <p className="text-sm text-gray-500">Please select a fee type to configure fees</p>

              )}

            </>

            )}

            </div>



            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">

              <button

                onClick={() => {

                  setIsFeeUpdateModalOpen(false);

                  setSelectedStudentForFeeUpdate(null);

                  setUpdateFeeType('');

                  setUpdateAnnualFee('');

                  setUpdateExamFee('0');

                  setUpdateMiscellaneousFee('0');

                  setUpdateLabFee('0');

                  setUpdateIncludeInMonthlyCalculation(false);

                  setUpdatePercentageOption('0');

                  setUpdateTuitionMonthlyFee('');

                  setOriginalFeeValues(null);

                }}

                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"

              >

                Cancel

              </button>

              <button

                onClick={async () => {

                  setUpdateFeeMessage(null);



                  // Validate fee type is selected

                  if (!updateFeeType) {

                    setUpdateFeeMessage({ type: 'error', text: 'Please select a fee type (SCHOOL or TUITION)' });

                    return;

                  }



                  // Validate fee amounts based on fee type

                  if (updateFeeType === 'SCHOOL') {

                    const annualAmount = updateAnnualFee ? parseInt(updateAnnualFee) : 0;

                    const examAmount = updateExamFee ? parseInt(updateExamFee) : 0;

                    const miscAmount = updateMiscellaneousFee ? parseInt(updateMiscellaneousFee) : 0;

                    const labAmount = updateLabFee ? parseInt(updateLabFee) : 0;



                    if (annualAmount === 0 && examAmount === 0 && miscAmount === 0 && labAmount === 0) {

                      setUpdateFeeMessage({ type: 'error', text: 'Please enter at least one fee component (Annual, Exam, Miscellaneous, or Lab fee)' });

                      return;

                    }

                  } else if (updateFeeType === 'TUITION') {

                    const monthlyAmount = updateTuitionMonthlyFee ? parseInt(updateTuitionMonthlyFee) : 0;

                    if (monthlyAmount === 0) {

                      setUpdateFeeMessage({ type: 'error', text: 'Please enter the monthly tuition fee' });

                      return;

                    }

                  }



                  // Check if any values have changed (only if we have original values)

                  let hasChanges = false;

                  if (originalFeeValues) {

                    if (updateFeeType === 'SCHOOL') {

                      if (

                        updateAnnualFee !== originalFeeValues.annualFee ||

                        updateExamFee !== originalFeeValues.examFee ||

                        updateMiscellaneousFee !== originalFeeValues.miscellaneousFee ||

                        updateLabFee !== originalFeeValues.labFee ||

                        updateIncludeInMonthlyCalculation !== originalFeeValues.includeInMonthlyCalculation ||

                        updatePercentageOption !== originalFeeValues.discountPercentage

                      ) {

                        hasChanges = true;

                      }

                    } else if (updateFeeType === 'TUITION') {

                      if (updateTuitionMonthlyFee !== originalFeeValues.monthlyAmount) {

                        hasChanges = true;

                      }

                    }



                    if (!hasChanges) {

                      setUpdateFeeMessage({ type: 'info', text: 'No values updated. Please modify at least one field before updating.' });

                      return;

                    }

                  }



                  // Calculate new values

                  let monthlyAmount, totalAmount;



                  if (updateFeeType === 'SCHOOL') {

                    const annualAmount = updateAnnualFee ? parseInt(updateAnnualFee) : 0;

                    const examAmount = updateExamFee ? parseInt(updateExamFee) : 0;

                    const miscAmount = updateMiscellaneousFee ? parseInt(updateMiscellaneousFee) : 0;

                    const labAmount = updateLabFee ? parseInt(updateLabFee) : 0;

                    const discount = updatePercentageOption ? parseInt(updatePercentageOption) : 0;



                    totalAmount = annualAmount + examAmount + miscAmount + labAmount;

                    totalAmount = totalAmount - Math.floor(totalAmount * (discount / 100));



                    if (updateIncludeInMonthlyCalculation) {

                      monthlyAmount = totalAmount > 0 ? Math.ceil(totalAmount / 12) : 0;

                    } else {

                      const annualWithDiscount = annualAmount - Math.floor(annualAmount * (discount / 100));

                      monthlyAmount = annualWithDiscount > 0 ? Math.ceil(annualWithDiscount / 12) : 0;

                    }

                  } else if (updateFeeType === 'TUITION') {

                    monthlyAmount = updateTuitionMonthlyFee ? parseInt(updateTuitionMonthlyFee) : 0;

                    const currentMonth = new Date().getMonth();

                    const monthsRemaining = 12 - currentMonth;

                    totalAmount = monthlyAmount > 0 ? monthlyAmount * monthsRemaining : 0;

                  }



                  // Get the fee record to update or create

                  const response = await axiosInstance.get(`/student-fee/student/${selectedStudentForFeeUpdate.id}`);

                  const fees = response.data.body;

                  const academicYearFees = fees.filter((f: any) => f.academicYearId === yearId);

                  const studentFee = academicYearFees[academicYearFees.length - 1];



                  // Create or update the fee record

                  try {

                    if (studentFee) {

                      // Update existing fee

                      await axiosInstance.patch(`/student-fee/${studentFee.id}`, {

                        monthlyAmount,

                        totalAmount,

                        annualFee: updateFeeType === 'SCHOOL' ? (updateAnnualFee ? parseInt(updateAnnualFee) : null) : null,

                        examFee: updateFeeType === 'SCHOOL' ? (updateExamFee ? parseInt(updateExamFee) : 0) : 0,

                        miscellaneousFee: updateFeeType === 'SCHOOL' ? (updateMiscellaneousFee ? parseInt(updateMiscellaneousFee) : 0) : 0,

                        labFee: updateFeeType === 'SCHOOL' ? (updateLabFee ? parseInt(updateLabFee) : 0) : 0,

                        includeInMonthlyCalculation: updateFeeType === 'SCHOOL' ? updateIncludeInMonthlyCalculation : false,

                        discountPercentage: updateFeeType === 'SCHOOL' ? (updatePercentageOption ? parseInt(updatePercentageOption) : 0) : 0,

                      });

                      setUpdateFeeMessage({ type: 'success', text: 'Fee updated successfully' });

                    } else {

                      // Create new fee

                      await axiosInstance.post('/student-fee', {

                        studentId: selectedStudentForFeeUpdate.id,

                        academicYearId: yearId,

                        feeType: updateFeeType,

                        monthlyAmount,

                        totalAmount,

                        annualFee: updateFeeType === 'SCHOOL' ? (updateAnnualFee ? parseInt(updateAnnualFee) : null) : null,

                        examFee: updateFeeType === 'SCHOOL' ? (updateExamFee ? parseInt(updateExamFee) : 0) : 0,

                        miscellaneousFee: updateFeeType === 'SCHOOL' ? (updateMiscellaneousFee ? parseInt(updateMiscellaneousFee) : 0) : 0,

                        labFee: updateFeeType === 'SCHOOL' ? (updateLabFee ? parseInt(updateLabFee) : 0) : 0,

                        includeInMonthlyCalculation: updateFeeType === 'SCHOOL' ? updateIncludeInMonthlyCalculation : false,

                        discountPercentage: updateFeeType === 'SCHOOL' ? (updatePercentageOption ? parseInt(updatePercentageOption) : 0) : 0,

                      });

                      setUpdateFeeMessage({ type: 'success', text: 'Fee created successfully' });

                    }

                    setTimeout(() => {

                      setIsFeeUpdateModalOpen(false);

                      setSelectedStudentForFeeUpdate(null);

                      setUpdateFeeType('');

                      setUpdateAnnualFee('');

                      setUpdateExamFee('0');

                      setUpdateMiscellaneousFee('0');

                      setUpdateLabFee('0');

                      setUpdateIncludeInMonthlyCalculation(false);

                      setUpdatePercentageOption('0');

                      setUpdateTuitionMonthlyFee('');

                      setOriginalFeeValues(null);

                      setUpdateFeeMessage(null);

                    }, 1500);

                  } catch (error) {

                    setUpdateFeeMessage({ type: 'error', text: 'Failed to update fee. Please try again.' });

                    console.error('Failed to update fee:', error);

                  }

                }}

                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

              >

                Update Fee

              </button>

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

                  setEditSectionRollPrefix('');

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

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number Prefix</label>

                  <input

                    type="text"

                    value={editSectionRollPrefix}

                    onChange={(e) => setEditSectionRollPrefix(e.target.value.toUpperCase())}

                    placeholder="e.g., A-, B-, SEC-"

                    pattern="^[A-Z]{1,3}-$"

                    title="1-3 uppercase letters followed by hyphen"

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                  />

                  <p className="text-xs text-gray-500 mt-1">

                    Leave empty to keep existing prefix. Format: 1-3 uppercase letters followed by hyphen (e.g., A-, B-)

                  </p>

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

                    setEditSectionRollPrefix('');

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



      {/* Record Payment Modal */}

      {isRecordPaymentModalOpen && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>

              <button

                type="button"

                onClick={() => {

                  setIsRecordPaymentModalOpen(false);

                  setSelectedFeeForPayment(null);

                  setPaymentMonth('');

                  setPaymentAmount('');

                  setPaymentMethod('CASH');

                  setPaymentNotes('');

                }}

                className="text-gray-400 hover:text-gray-600"

              >

                <FiX className="w-5 h-5" />

              </button>

            </div>



            {selectedFeeForPayment && (

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">

                <p className="text-sm text-gray-700">

                  <span className="font-medium">Student:</span> {selectedFeeForPayment.student?.user?.firstname} {selectedFeeForPayment.student?.user?.lastname}

                </p>

                <p className="text-sm text-gray-700">

                  <span className="font-medium">Fee Type:</span> {selectedFeeForPayment.feeType}

                </p>

                <p className="text-sm text-gray-700">

                  <span className="font-medium">Balance:</span> ₹{Number(selectedFeeForPayment.balanceAmount).toLocaleString()}

                </p>

              </div>

            )}



            <form onSubmit={async (e) => {

              e.preventDefault();

              if (!selectedFeeForPayment) return;



              try {

                await axiosInstance.post('/student-fee/payment', {

                  studentFeeId: selectedFeeForPayment.id,

                  month: paymentMonth,

                  amount: parseInt(paymentAmount),

                  paymentMethod,

                  notes: paymentNotes,

                });



                setSuccess('Payment recorded successfully');

                setTimeout(() => setSuccess(null), 3000);

                setIsRecordPaymentModalOpen(false);

                setSelectedFeeForPayment(null);

                setPaymentMonth('');

                setPaymentAmount('');

                setPaymentMethod('CASH');

                setPaymentNotes('');

                fetchEnrollments(); // Refresh enrollments to get updated fee data

              } catch (error: any) {

                console.error('Failed to record payment:', error);

                setError(error.response?.data?.message || 'Failed to record payment');

              }

            }}>

              <div className="space-y-4">

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>

                  <select

                    value={paymentMonth}

                    onChange={(e) => setPaymentMonth(e.target.value)}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    required

                  >

                    <option value="">Select Month</option>

                    <option value="April">April</option>

                    <option value="May">May</option>

                    <option value="June">June</option>

                    <option value="July">July</option>

                    <option value="August">August</option>

                    <option value="September">September</option>

                    <option value="October">October</option>

                    <option value="November">November</option>

                    <option value="December">December</option>

                    <option value="January">January</option>

                    <option value="February">February</option>

                    <option value="March">March</option>

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>

                  <input

                    type="number"

                    value={paymentAmount}

                    onChange={(e) => setPaymentAmount(e.target.value)}

                    placeholder="Enter amount"

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    required

                  />

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>

                  <select

                    value={paymentMethod}

                    onChange={(e) => setPaymentMethod(e.target.value)}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    required

                  >

                    <option value="CASH">Cash</option>

                    <option value="UPI">UPI</option>

                    <option value="BANK_TRANSFER">Bank Transfer</option>

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>

                  <textarea

                    value={paymentNotes}

                    onChange={(e) => setPaymentNotes(e.target.value)}

                    placeholder="Add any notes..."

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    rows={2}

                  />

                </div>

              </div>

              <div className="flex justify-end space-x-3 pt-4 mt-6">

                <button

                  type="button"

                  onClick={() => {

                    setIsRecordPaymentModalOpen(false);

                    setSelectedFeeForPayment(null);

                    setPaymentMonth('');

                    setPaymentAmount('');

                    setPaymentMethod('CASH');

                    setPaymentNotes('');

                  }}

                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"

                >

                  Record Payment

                </button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* Student Details Modal */}

      {isStudentDetailsModalOpen && selectedStudentForDetails && (

        <StudentDetailsModal

          isOpen={isStudentDetailsModalOpen}

          onClose={() => {

            setIsStudentDetailsModalOpen(false);

            setSelectedStudentForDetails(null);

          }}

          student={selectedStudentForDetails.student}

          enrollment={selectedStudentForDetails.enrollment}

          section={sections.find((s) => s.id === selectedSection)!}

          academicYear={academicYear || { id: yearId, name: '' }}

          onUpdateFee={() => {
            // Get the fee information from enrollment
            const enrollment = selectedStudentForDetails.enrollment;
            const fees = (enrollment as any)?.fees || [];
            const tuitionFee = fees.find((f: any) => f && f.feeType === 'TUITION');
            const schoolFee = fees.find((f: any) => f && f.feeType === 'SCHOOL');
            
            if (tuitionFee) {
              setSelectedStudentFeeId(tuitionFee.id);
              setSelectedStudentForFeeUpdate({ 
                student: selectedStudentForDetails.student, 
                feeType: 'TUITION' 
              });
              setIsStudentDetailsModalOpen(false);
              setIsFeeUpdateModalOpen(true);
            } else if (schoolFee) {
              setSelectedStudentFeeId(schoolFee.id);
              setSelectedStudentForFeeUpdate({ 
                student: selectedStudentForDetails.student, 
                feeType: 'SCHOOL' 
              });
              setIsStudentDetailsModalOpen(false);
              setIsFeeUpdateModalOpen(true);
            } else {
              // No fee exists, show toast to setup fees first
              setToastModal({
                isOpen: true,
                type: 'info',
                message: 'Please setup fees for this student first',
                showConfirm: false,
              });
            }
          }}

          onUpdateStatus={() => {

            setIsStudentDetailsModalOpen(false);

          }}

          onShowFeeDetails={(studentFeeId: string, feeType: string) => {

            setSelectedStudentFeeId(studentFeeId);

            setSelectedStudentForDetails({ 
              student: selectedStudentForDetails.student, 
              enrollment: selectedStudentForDetails.enrollment, 
              feeType: feeType as 'TUITION' | 'SCHOOL' 
            });

            setIsFeeDetailsModalOpen(true);

          }}

        />

      )}

      {/* Toast Modal */}

      <ToastModal

        isOpen={toastModal.isOpen}

        type={toastModal.type}

        title={toastModal.title}

        message={toastModal.message}

        showConfirm={toastModal.showConfirm}

        onConfirm={toastModal.onConfirm}

        onClose={() => setToastModal({ isOpen: false, type: 'info', message: '', showConfirm: false })}

      />

      {/* Fee Details Modal */}

      {isFeeDetailsModalOpen && selectedStudentForDetails && (
        <FeeDetailsModal
          isOpen={isFeeDetailsModalOpen}
          onClose={() => {
            setIsFeeDetailsModalOpen(false);
            setSelectedStudentFeeId('');
          }}
          student={selectedStudentForDetails.student}
          studentFeeId={selectedStudentFeeId}
          academicYearName={academicYear?.name || ''}
          feeType={selectedStudentForDetails.feeType}
        />
      )}

      {/* Fee Update Modal */}
      {isFeeUpdateModalOpen && selectedStudentForFeeUpdate && (
        <FeeUpdateModal
          isOpen={isFeeUpdateModalOpen}
          onClose={() => {
            setIsFeeUpdateModalOpen(false);
            setSelectedStudentFeeId('');
            setSelectedStudentForFeeUpdate(null);
          }}
          student={selectedStudentForFeeUpdate.student}
          studentFeeId={selectedStudentFeeId}
          feeType={selectedStudentForFeeUpdate.feeType}
          onSuccess={() => {
            // Refresh enrollments to get updated fee data
            fetchEnrollments();
          }}
        />
      )}

    </div>

  );

}

