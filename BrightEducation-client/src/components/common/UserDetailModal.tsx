import React, { useState, useEffect } from 'react';
import { FiX, FiEdit2, FiSave, FiXCircle, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiDroplet, FiGlobe, FiAlertCircle, FiClock, FiShield, FiBriefcase, FiUserCheck, FiCheckCircle } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';
import UserAvatar from './UserAvatar';
import ToastModal from './ToastModal';
import type { ToastType } from './ToastModal';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyContactRelation: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  email: string;
  role: string;
  isActive: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  profileImg?: string;
  isEnrolled: boolean
}

interface RoleData {
  id: string;
  userId: string;
  [key: string]: any;
}

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  roleData: RoleData | null;
  onDelete?: () => void;
  onUpdate?: () => void;
  onUserUpdated?: (updatedUser: any) => void;
}

interface CreatorInfo {
  firstname: string;
  lastname: string;
  email: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  roleData,
  onDelete,
  onUpdate,
  onUserUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User> & Partial<RoleData>>({});
  const [editProfileImg, setEditProfileImg] = useState<File | null>(null);
  const [convertToCreated, setConvertToCreated] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [loadingCreator, setLoadingCreator] = useState(false);
  const [toastModal, setToastModal] = useState<{
    isOpen: boolean;
    type: ToastType;
    title?: string;
    message: string;
    showConfirm: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
    showConfirm: false,
  });

  useEffect(() => {
    if (user) {
      setEditData({ ...user, ...roleData });
    }
  }, [user, roleData]);

  useEffect(() => {
    if (user?.createdById && isOpen) {
      fetchCreatorInfo(user.createdById);
    }
  }, [user?.createdById, isOpen]);

  const fetchCreatorInfo = async (creatorId: string) => {
    setLoadingCreator(true);
    try {
      const response = await axiosInstance.get(`/user/${creatorId}`);
      const creator = response.data.body.user;
      setCreatorInfo({
        firstname: creator.firstname,
        lastname: creator.lastname,
        email: creator.email,
      });
    } catch (err) {
      setCreatorInfo(null);
    } finally {
      setLoadingCreator(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...user, ...roleData });
    setEditProfileImg(null);
    setConvertToCreated(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      const formData = new FormData();
      
      // Add only User fields to form data (not role-specific fields)
      if (editData.firstname) formData.append('firstname', editData.firstname);
      if (editData.lastname) formData.append('lastname', editData.lastname);
      if (editData.gender) formData.append('gender', editData.gender);
      if (editData.dateOfBirth) formData.append('dateOfBirth', editData.dateOfBirth);
      if (editData.phone) formData.append('phone', editData.phone);
      if (editData.address) formData.append('address', editData.address);
      if (editData.emergencyContact) formData.append('emergencyContact', editData.emergencyContact);
      if (editData.emergencyContactRelation) formData.append('emergencyContactRelation', editData.emergencyContactRelation);
      if (editData.bloodGroup) formData.append('bloodGroup', editData.bloodGroup);
      if (editData.nationality) formData.append('nationality', editData.nationality);
      if (editData.religion) formData.append('religion', editData.religion);
      if (editData.email) formData.append('email', editData.email);
      
      // Add status field if changed
      if (editData.isActive && editData.isActive !== user.isActive) {
        formData.append('isActive', editData.isActive);
      }
      
      // If checkbox is checked and user is DELETED or RESET, convert to CREATED
      if (convertToCreated && (user.isActive === 'DELETED' || user.isActive === 'RESET')) {
        formData.append('isActive', 'CREATED');
      }
      
      // Add profile image if a new one was selected
      if (editProfileImg) {
        formData.append('profileImg', editProfileImg);
      }
      
      await axiosInstance.put(`/user/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setIsEditing(false);
      setEditProfileImg(null);
      setConvertToCreated(false);
      
      // Fetch updated user data to get new profile image URL
      const response = await axiosInstance.get(`/user/${user.id}`);
      const updatedUser = response.data.body.user;
      
      if (onUserUpdated) onUserUpdated(updatedUser);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      alert('Failed to update user');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async () => {
    if (!user?.id) return;
    setToastModal({
      isOpen: true,
      type: 'error',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      showConfirm: true,
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/user/${user.id}`);
          if (onDelete) onDelete();
          onClose();
        } catch (err: any) {
          setToastModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete user',
            showConfirm: false,
          });
        }
      },
    });
  };

  const handleActivate = async () => {
    if (!user?.id) return;
    setToastModal({
      isOpen: true,
      type: 'confirm',
      title: 'Activate User',
      message: 'Are you sure you want to activate this user? They will be able to access the platform.',
      showConfirm: true,
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('isActive', 'ACTIVE');
          
          await axiosInstance.put(`/user/${user.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          // Fetch updated user data
          const response = await axiosInstance.get(`/user/${user.id}`);
          const updatedUser = response.data.body.user;
          
          if (onUserUpdated) onUserUpdated(updatedUser);
          if (onUpdate) onUpdate();
          setToastModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'User activated successfully',
            showConfirm: false,
          });
        } catch (err: any) {
          setToastModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to activate user',
            showConfirm: false,
          });
        }
      },
    });
  };

  const renderField = (label: string, field: string, value: any, icon: React.ReactNode) => {
    // Format date fields
    let displayValue = value;
    if (field.toLowerCase().includes('date') || field.toLowerCase().includes('joined') || field.toLowerCase().includes('resignation')) {
      displayValue = formatDate(value);
    }
    // Handle numeric fields that can be 0
    if (field === 'expInYrs' && value === 0) {
      displayValue = '0';
    }
    
    if (isEditing) {
      return (
        <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/50">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            <span className="text-gray-400">{icon}</span>
            {label}
          </label>
          <input
            type="text"
            value={editData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-800 transition-all shadow-2xs"
          />
        </div>
      );
    }
    return (
      <div className="bg-gray-50/50 hover:bg-gray-50/80 p-3.5 rounded-xl border border-gray-100/50 transition-all">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="text-gray-400">{icon}</span>
          {label}
        </label>
        <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">{displayValue !== undefined && displayValue !== null && displayValue !== '' ? displayValue : 'N/A'}</p>
      </div>
    );
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-gray-100 transition-all">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10 shadow-xs">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-gray-500" />
            User Details
          </h2>
          <div className="flex items-center gap-2">
            {user?.isActive === 'CREATED' && (
              <button
                onClick={handleActivate}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-semibold transition-all shadow-2xs"
              >
                <FiUserCheck className="w-4 h-4" />
                Activate
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-semibold transition-all shadow-2xs"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete
            </button>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-semibold transition-all shadow-xs"
                >
                  <FiSave className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-semibold transition-all shadow-2xs"
                >
                  <FiXCircle className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-semibold transition-all shadow-2xs"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-75px)]">
          {/* Elegant Profile Header Card */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-xs">
            <div className="relative group">
              {editProfileImg ? (
                <img
                  src={URL.createObjectURL(editProfileImg)}
                  alt={`${user.firstname} ${user.lastname}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <UserAvatar
                  profileImg={user.profileImg}
                  alt={`${user.firstname} ${user.lastname}`}
                  size="lg"
                  className="border-4 border-white shadow-md transition-all group-hover:scale-102"
                />
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {user.firstname} {user.lastname}
              </h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden md:block"></span>
                <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md border border-blue-200">
                  {user.role}
                </span>
                {
                  user.isEnrolled ? <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md border border-blue-200">
                  Enrolled
                </span> : <></>
                }
                
                {(() => {
                  switch (user.isActive) {
                    case 'CREATED':
                      return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase">Created</span>;
                    case 'ACTIVE':
                      return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-green-50 text-green-700 border border-green-100 uppercase">Active</span>;
                    case 'RESET':
                      return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100 uppercase">Reset</span>;
                    case 'DELETED':
                      return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-red-50 text-red-700 border border-red-100 uppercase">Deleted</span>;
                    default:
                      return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-gray-50 text-gray-700 border border-gray-100 uppercase">{user.isActive || 'N/A'}</span>;
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Profile Image Upload - Only in edit mode */}
          {isEditing && (
            <div className="mb-8 p-6 bg-blue-50/20 rounded-2xl border border-dashed border-blue-200 text-center flex flex-col items-center justify-center transition-all hover:bg-blue-50/40">
              <FiUser className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm font-bold text-gray-800 mb-1">Update Profile Picture</p>
              <p className="text-xs text-gray-400 mb-4">PNG, JPG or WEBP up to 5MB</p>
              <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm shadow-2xs transition-all inline-flex items-center gap-1.5">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditProfileImg(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {editProfileImg && (
                <p className="text-xs font-semibold text-green-600 mt-2.5">Ready to upload: {editProfileImg.name}</p>
              )}
            </div>
          )}

          {/* Basic User Information */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <FiUser className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Full Name', 'firstname', user.firstname, <FiUser className="w-4 h-4" />)}
              {renderField('Last Name', 'lastname', user.lastname, <FiUser className="w-4 h-4" />)}
              {renderField('Email', 'email', user.email, <FiMail className="w-4 h-4" />)}
              {renderField('Phone', 'phone', user.phone, <FiPhone className="w-4 h-4" />)}
              {renderField('Gender', 'gender', user.gender, <FiShield className="w-4 h-4" />)}
              {renderField('Date of Birth', 'dateOfBirth', formatDate(user.dateOfBirth), <FiCalendar className="w-4 h-4" />)}
              {renderField('Address', 'address', user.address, <FiMapPin className="w-4 h-4" />)}
              {renderField('Blood Group', 'bloodGroup', user.bloodGroup, <FiDroplet className="w-4 h-4" />)}
              {renderField('Nationality', 'nationality', user.nationality, <FiGlobe className="w-4 h-4" />)}
              {renderField('Religion', 'religion', user.religion, <FiBriefcase className="w-4 h-4" />)}
              {renderField('Emergency Contact', 'emergencyContact', user.emergencyContact, <FiAlertCircle className="w-4 h-4" />)}
              {renderField('Emergency Contact Relation', 'emergencyContactRelation', user.emergencyContactRelation, <FiAlertCircle className="w-4 h-4" />)}
              <div className="bg-gray-50/50 hover:bg-gray-50/80 p-3.5 rounded-xl border border-gray-100/50 transition-all">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-gray-400" />
                  Role
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6 capitalize">{user.role || 'N/A'}</p>
              </div>
              {isEditing ? (
                <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/50">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-1.5">
                    <FiCheckCircle className="w-4 h-4 text-gray-400" />
                    Status
                  </label>
                  <select
                    value={editData.isActive || user.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-800 transition-all shadow-2xs"
                  >
                    <option value="CREATED">Created</option>
                    <option value="ACTIVE">Active</option>
                    <option value="RESET">Reset</option>
                    <option value="DELETED">Deleted</option>
                  </select>
                  {(user.isActive === 'DELETED' || user.isActive === 'RESET') && (
                    <div className="mt-2.5 pl-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={convertToCreated}
                          onChange={(e) => setConvertToCreated(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        Convert to Created on save
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50/50 hover:bg-gray-50/80 p-3.5 rounded-xl border border-gray-100/50 transition-all">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-gray-400" />
                    Status
                  </label>
                  <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6 capitalize">{user.isActive || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Role-Specific Data */}
          {roleData && Object.keys(roleData).length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <FiBriefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {user.role?.charAt(0) + user.role?.slice(1).toLowerCase()} Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(roleData)
                  .filter(([key]) => !['id', 'userId'].includes(key))
                  .map(([key, value]) => {
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();
                    return <div key={key}>{renderField(label, key, value, <FiBriefcase className="w-4 h-4" />)}</div>;
                  })}
              </div>
            </div>
          )}

          {/* Creator Information & Timestamps Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Creator Info */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
                <FiUserCheck className="w-5 h-5 text-green-600" />
                <h3 className="text-md font-bold text-gray-800">Created By</h3>
              </div>
              {loadingCreator ? (
                <div className="flex items-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                </div>
              ) : creatorInfo ? (
                <div className="space-y-1.5 pl-1">
                  <p className="text-sm font-bold text-gray-800">
                    {creatorInfo.firstname} {creatorInfo.lastname}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <FiMail className="w-3.5 h-3.5" />
                    {creatorInfo.email}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 pl-1">System Account</p>
              )}
            </div>

            {/* Timestamps */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
                <FiClock className="w-5 h-5 text-amber-600" />
                <h3 className="text-md font-bold text-gray-800">Timestamps</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-1">
                <div>
                  <label className="text-xxs font-semibold text-gray-400 uppercase tracking-wider block">Created At</label>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xxs font-semibold text-gray-400 uppercase tracking-wider block">Updated At</label>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Modal */}
      <ToastModal
        isOpen={toastModal.isOpen}
        onClose={() => setToastModal({ ...toastModal, isOpen: false })}
        title={toastModal.title}
        message={toastModal.message}
        type={toastModal.type}
        showConfirm={toastModal.showConfirm}
        onConfirm={toastModal.onConfirm}
      />
    </div>
  );
};

export default UserDetailModal;
