import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook, FiClock } from 'react-icons/fi';
import { LuReceiptIndianRupee } from 'react-icons/lu';
import axiosInstance from '../../lib/axios';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  role: string;
  isActive: string;
  isEnrolled: boolean;
  profileImg?: string;
}

interface StudentEnrollment {
  id: string;
  studentId: string;
  academicYearId: string;
  sectionTenureId: string;
  rollNumber?: string;
  status?: string;
  createdAt?: string;
}

interface ClassTenure {
  id: string;
  name: string;
}

interface SectionTenure {
  id: string;
  name: string;
  classTenure?: ClassTenure;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface StudentFee {
  id: string;
  feeType: string;
  monthlyAmount: number;
  totalAmount: number;
  balanceAmount: number;
  annualFee?: number;
  examFee?: number;
  miscellaneousFee?: number;
  labFee?: number;
}

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  enrollment: StudentEnrollment;
  section: SectionTenure;
  academicYear: AcademicYear;
  onUpdateFee: () => void;
  onUpdateStatus: () => void;
  onShowFeeDetails?: (studentFeeId: string, feeType: string) => void;
}

export function StudentDetailsModal({
  isOpen,
  onClose,
  student,
  enrollment,
  section,
  academicYear,
  onUpdateFee,
  onUpdateStatus,
  onShowFeeDetails,
}: StudentDetailsModalProps) {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);

  useEffect(() => {
    if (isOpen && student.id) {
      fetchStudentFees();
    }
  }, [isOpen, student.id]);

  const fetchStudentFees = async () => {
    try {
      setLoadingFees(true);
      const response = await axiosInstance.get(`/student-fee/student/${student.id}`);
      setStudentFees(response.data.body || []);
    } catch (error) {
      console.error('Failed to fetch student fees:', error);
    } finally {
      setLoadingFees(false);
    }
  };

  if (!isOpen) return null;

  const currentAcademicYearFee = studentFees.find(
    (f) => (f as any).academicYearId === academicYear.id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {student.firstname} {student.lastname}
              </h2>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiUser className="w-5 h-5 text-blue-600" />
              <span>Personal Information</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {student.firstname} {student.lastname || ''}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-2">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span>{student.email}</span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-2">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <span>{student.phone || 'N/A'}</span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{student.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span>{student.address || 'N/A'}</span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Account Status</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.isActive === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {student.isActive}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Enrolled</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.isEnrolled
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {student.isEnrolled ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Enrollment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiBook className="w-5 h-5 text-blue-600" />
              <span>Enrollment Information</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Roll Number</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {enrollment.rollNumber ? (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      {enrollment.rollNumber}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Class</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {section.classTenure?.name || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Section</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{section.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Academic Year</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{academicYear.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Enrollment Date</label>
                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {enrollment.createdAt
                      ? new Date(enrollment.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Enrollment Status</label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      enrollment.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : enrollment.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : enrollment.status === 'WRONG_ENTRY'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {enrollment.status || 'ACTIVE'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <LuReceiptIndianRupee className="w-5 h-5 text-blue-600" />
              <span>Fee Information</span>
            </h3>
            {loadingFees ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading fee details...</p>
              </div>
            ) : currentAcademicYearFee ? (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Fee Type</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {currentAcademicYearFee.feeType}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Monthly Amount</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-1">
                      <LuReceiptIndianRupee className="w-4 h-4" />
                      <span>{currentAcademicYearFee.monthlyAmount.toLocaleString()}</span>
                    </p>
                  </div>
                  {currentAcademicYearFee.feeType === 'SCHOOL' && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Total Amount</label>
                        <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-1">
                          <LuReceiptIndianRupee className="w-4 h-4" />
                          <span>{currentAcademicYearFee.totalAmount?.toLocaleString() || 0}</span>
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Balance Due</label>
                        <p className="text-sm font-medium text-gray-900 mt-1 flex items-center space-x-1">
                          <LuReceiptIndianRupee className="w-4 h-4" />
                          <span
                            className={
                              (currentAcademicYearFee.balanceAmount || 0) > 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }
                          >
                            {(currentAcademicYearFee.balanceAmount || 0).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                  {currentAcademicYearFee.feeType === 'TUITION' && (
                    <div className="col-span-2">
                      <button
                        onClick={() => {
                          onClose();
                          onShowFeeDetails?.(currentAcademicYearFee.id, currentAcademicYearFee.feeType);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <LuReceiptIndianRupee className="w-4 h-4" />
                        <span>Show Fee Details</span>
                      </button>
                    </div>
                  )}
                  {currentAcademicYearFee.feeType === 'SCHOOL' && (
                    <div className="col-span-2">
                      <button
                        onClick={() => {
                          onClose();
                          onShowFeeDetails?.(currentAcademicYearFee.id, currentAcademicYearFee.feeType);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <LuReceiptIndianRupee className="w-4 h-4" />
                        <span>Show Fee Details</span>
                      </button>
                    </div>
                  )}
                </div>

                {currentAcademicYearFee.feeType === 'SCHOOL' && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Fee Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Fees:</span>
                        <span className="font-medium">
                          ₹{currentAcademicYearFee.annualFee?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exam Fees:</span>
                        <span className="font-medium">
                          ₹{currentAcademicYearFee.examFee?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Miscellaneous:</span>
                        <span className="font-medium">
                          ₹{currentAcademicYearFee.miscellaneousFee?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lab Fees:</span>
                        <span className="font-medium">
                          ₹{currentAcademicYearFee.labFee?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-3">No fee information available for this academic year</p>
                <button
                  onClick={onUpdateFee}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  <LuReceiptIndianRupee className="w-4 h-4" />
                  <span>Setup Fees</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onUpdateFee}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <LuReceiptIndianRupee className="w-4 h-4" />
            <span>Update Fee</span>
          </button>
          <button
            onClick={onUpdateStatus}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FiClock className="w-4 h-4" />
            <span>Update Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}
