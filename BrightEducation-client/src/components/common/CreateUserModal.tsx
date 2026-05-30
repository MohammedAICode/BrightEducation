import React, { useState } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiDroplet, FiGlobe, FiAlertCircle, FiShield, FiBriefcase } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'MANAGEMENT' | 'TEACHER' | 'STUDENT' | 'STAFF';
  onSuccess?: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  role,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [educationLevel, setEducationLevel] = useState<string>('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-generate email when firstname changes
    if (field === 'firstname' && value) {
      const email = `${value.toLowerCase()}@bright.com`;
      setFormData((prev) => ({ ...prev, email }));
    }
  };

  const handlePhoneChange = (field: string, value: string) => {
    // Only allow numeric characters
    const numericValue = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [field]: numericValue }));
  };

  const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImg(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      
      // Add common user fields
      data.append('role', role);
      if (formData.firstname) data.append('firstname', formData.firstname);
      if (formData.lastname) data.append('lastname', formData.lastname);
      if (formData.gender) data.append('gender', formData.gender);
      if (formData.dateOfBirth) data.append('dateOfBirth', formData.dateOfBirth);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.address) data.append('address', formData.address);
      if (formData.emergencyContact) data.append('emergencyContact', formData.emergencyContact);
      if (formData.emergencyContactRelation) data.append('emergencyContactRelation', formData.emergencyContactRelation);
      if (formData.bloodGroup) data.append('bloodGroup', formData.bloodGroup);
      if (formData.nationality) data.append('nationality', formData.nationality || 'Indian');
      if (formData.religion) data.append('religion', formData.religion);
      if (formData.email) data.append('email', formData.email);
      
      // Set initial status as CREATED - admin must activate the user
      data.append('isActive', 'CREATED');
      
      // Add profile image if selected
      if (profileImg) {
        data.append('profileImg', profileImg);
      }

      // Add role-specific fields
      if (role === 'MANAGEMENT') {
        if (formData.employeeId) data.append('employeeId', formData.employeeId);
        if (formData.joiningDate) data.append('joiningDate', formData.joiningDate);
        if (formData.expInYrs) data.append('expInYrs', formData.expInYrs);
        if (formData.manageType) data.append('manageType', formData.manageType);
      } else if (role === 'TEACHER') {
        if (formData.employeeId) data.append('employeeId', formData.employeeId);
        if (formData.joiningDate) data.append('joiningDate', formData.joiningDate);
        if (formData.expInYrs) data.append('expInYrs', formData.expInYrs);
        if (formData.annualSalary) data.append('annualSalary', formData.annualSalary);
        if (formData.qualification) data.append('qualification', formData.qualification);
        if (formData.subjects) data.append('subjects', formData.subjects);
        if (formData.resignationDate) data.append('resignationDate', formData.resignationDate);
      } else if (role === 'STUDENT') {
        if (formData.admissionNo) data.append('admissionNo', formData.admissionNo);
        if (formData.admissionDate) data.append('admissionDate', formData.admissionDate);
        if (formData.rollNumber) data.append('rollNumber', formData.rollNumber);
        if (formData.classGrade) data.append('classGrade', formData.classGrade);
        if (formData.section) data.append('section', formData.section || 'A');
        if (formData.prevSchool) data.append('prevSchool', formData.prevSchool);
        // Parent fields for students
        if (formData.parentRelation) data.append('parentRelation', formData.parentRelation);
        if (formData.parentName) data.append('parentName', formData.parentName);
        if (formData.parentPhone) data.append('parentPhone', formData.parentPhone);
        if (formData.parentOccupation) data.append('parentOccupation', formData.parentOccupation);
      } else if (role === 'STAFF') {
        if (formData.employeeId) data.append('employeeId', formData.employeeId);
        if (formData.joiningDate) data.append('joiningDate', formData.joiningDate);
        if (formData.expInYrs) data.append('expInYrs', formData.expInYrs);
        if (formData.annualSalary) data.append('annualSalary', formData.annualSalary);
        if (formData.resignationDate) data.append('resignationDate', formData.resignationDate);
      }

      await axiosInstance.post('/user/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (onSuccess) onSuccess();
      onClose();
      setFormData({});
      setProfileImg(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Create {role}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Basic User Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 mb-4">
                <div className="p-5 bg-blue-50/25 rounded-xl border border-dashed border-blue-200 text-center flex flex-col items-center justify-center transition-all hover:bg-blue-50/45">
                  <FiUser className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-sm font-bold text-gray-800 mb-0.5">Profile Picture</p>
                  <p className="text-xs text-gray-400 mb-3.5">PNG, JPG or WEBP up to 5MB</p>
                  <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm shadow-2xs transition-all inline-flex items-center gap-1.5">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImgChange}
                      className="hidden"
                    />
                  </label>
                  {profileImg && (
                    <p className="text-xs font-semibold text-green-600 mt-2">Selected: {profileImg.name}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiUser className="w-4 h-4" />
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstname || ''}
                  onChange={(e) => handleChange('firstname', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiUser className="w-4 h-4" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastname || ''}
                  onChange={(e) => handleChange('lastname', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiMail className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiShield className="w-4 h-4" />
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiCalendar className="w-4 h-4" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiPhone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handlePhoneChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiMapPin className="w-4 h-4" />
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Emergency Contact *
                </label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact || ''}
                  onChange={(e) => handlePhoneChange('emergencyContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Emergency Contact Relation *
                </label>
                <select
                  required
                  value={formData.emergencyContactRelation || ''}
                  onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiDroplet className="w-4 h-4" />
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup || ''}
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiGlobe className="w-4 h-4" />
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality || 'Indian'}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FiBriefcase className="w-4 h-4" />
                  Religion
                </label>
                <select
                  value={formData.religion || ''}
                  onChange={(e) => handleChange('religion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Jain">Jain</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">{role} Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {role === 'MANAGEMENT' && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeId || ''}
                      onChange={(e) => handleChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="w-4 h-4" />
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.joiningDate || ''}
                      onChange={(e) => handleChange('joiningDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={formData.expInYrs || '0'}
                      onChange={(e) => handleChange('expInYrs', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Management Type *
                    </label>
                    <select
                      required
                      value={formData.manageType || ''}
                      onChange={(e) => handleChange('manageType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="ACCOUNTS">Accounts</option>
                      <option value="CLASS_TEACHER">Class Teacher</option>
                      <option value="INCHARGE">Incharge</option>
                    </select>
                  </div>
                </>
              )}

              {role === 'TEACHER' && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeId || ''}
                      onChange={(e) => handleChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="w-4 h-4" />
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.joiningDate || ''}
                      onChange={(e) => handleChange('joiningDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={formData.expInYrs || '0'}
                      onChange={(e) => handleChange('expInYrs', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Annual Salary
                    </label>
                    <input
                      type="number"
                      value={formData.annualSalary || ''}
                      onChange={(e) => handleChange('annualSalary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Qualification *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.qualification || ''}
                      onChange={(e) => handleChange('qualification', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Subjects * (comma separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subjects || ''}
                      onChange={(e) => handleChange('subjects', e.target.value)}
                      placeholder="Math, Science, English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="w-4 h-4" />
                      Resignation Date
                    </label>
                    <input
                      type="date"
                      value={formData.resignationDate || ''}
                      onChange={(e) => handleChange('resignationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {role === 'STUDENT' && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Admission No *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.admissionNo || ''}
                      onChange={(e) => handleChange('admissionNo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="w-4 h-4" />
                      Admission Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.admissionDate || ''}
                      onChange={(e) => handleChange('admissionDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber || ''}
                      onChange={(e) => handleChange('rollNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Class Grade *
                    </label>
                    <select
                      required
                      value={educationLevel || ''}
                      onChange={(e) => {
                        setEducationLevel(e.target.value);
                        handleChange('classGrade', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Class Grade</option>
                      <option value="Pre-Primary">Pre-Primary</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                      <option value="3rd">3rd</option>
                      <option value="4th">4th</option>
                      <option value="5th">5th</option>
                      <option value="6th">6th</option>
                      <option value="7th">7th</option>
                      <option value="8th">8th</option>
                      <option value="9th">9th</option>
                      <option value="10th">10th</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Degree">Degree</option>
                    </select>
                  </div>
                  {educationLevel === 'Intermediate' && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FiBriefcase className="w-4 h-4" />
                        Course *
                      </label>
                      <select
                        required
                        value={formData.course || ''}
                        onChange={(e) => handleChange('course', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Course</option>
                        <option value="MPC">MPC</option>
                        <option value="BiPC">BiPC</option>
                        <option value="CEC">CEC</option>
                        <option value="Vocational">Vocational</option>
                      </select>
                    </div>
                  )}
                  {educationLevel === 'Degree' && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FiBriefcase className="w-4 h-4" />
                        Degree Course *
                      </label>
                      <select
                        required
                        value={formData.degreeCourse || ''}
                        onChange={(e) => handleChange('degreeCourse', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Degree Course</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="B.E">B.E</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="B.Com">B.Com</option>
                        <option value="B.A">B.A</option>
                        <option value="BBA">BBA</option>
                        <option value="BCA">BCA</option>
                        <option value="B.Pharm">B.Pharm</option>
                        <option value="MBBS">MBBS</option>
                        <option value="BDS">BDS</option>
                        <option value="B.Arch">B.Arch</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Section
                    </label>
                    <input
                      type="text"
                      value={formData.section || 'A'}
                      onChange={(e) => handleChange('section', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Previous School
                    </label>
                    <input
                      type="text"
                      value={formData.prevSchool || ''}
                      onChange={(e) => handleChange('prevSchool', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Parent Information */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiUser className="w-4 h-4" />
                      Parent Relation
                    </label>
                    <input
                      type="text"
                      value={formData.parentRelation || ''}
                      onChange={(e) => handleChange('parentRelation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiUser className="w-4 h-4" />
                      Parent Name
                    </label>
                    <input
                      type="text"
                      value={formData.parentName || ''}
                      onChange={(e) => handleChange('parentName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiPhone className="w-4 h-4" />
                      Parent Phone
                    </label>
                    <input
                      type="text"
                      value={formData.parentPhone || ''}
                      onChange={(e) => handlePhoneChange('parentPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Parent Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.parentOccupation || ''}
                      onChange={(e) => handleChange('parentOccupation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {role === 'STAFF' && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeId || ''}
                      onChange={(e) => handleChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="w-4 h-4" />
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.joiningDate || ''}
                      onChange={(e) => handleChange('joiningDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={formData.expInYrs || '0'}
                      onChange={(e) => handleChange('expInYrs', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiBriefcase className="w-4 h-4" />
                      Annual Salary
                    </label>
                    <input
                      type="number"
                      value={formData.annualSalary || ''}
                      onChange={(e) => handleChange('annualSalary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="w-4 h-4" />
                      Resignation Date
                    </label>
                    <input
                      type="date"
                      value={formData.resignationDate || ''}
                      onChange={(e) => handleChange('resignationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
