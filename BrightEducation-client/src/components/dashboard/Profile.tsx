import { FiUser, FiMail, FiShield, FiCalendar, FiMapPin, FiDroplet, FiGlobe, FiBriefcase, FiAlertCircle, FiLock, FiEye, FiEyeOff, FiEdit, FiX } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import UserAvatar from '../common/UserAvatar';
import { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axios';

const Profile: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await axiosInstance.get('/profile-update/my-requests');
      setMyRequests(response.data.body || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const handleProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Compare with original user data and only include changed fields
    const changedFields: Record<string, string> = {};
    
    Object.entries(editData).forEach(([key, value]) => {
      const originalValue = user?.[key as keyof typeof user];
      let normalizedOriginal = originalValue || '';
      let normalizedNew = value || '';
      
      // Special handling for dateOfBirth
      if (key === 'dateOfBirth' && originalValue) {
        normalizedOriginal = new Date(originalValue as string).toISOString().split('T')[0];
      }
      
      // Only include if value has actually changed
      if (normalizedNew !== normalizedOriginal && normalizedNew !== '') {
        changedFields[key] = normalizedNew;
      }
    });

    if (Object.keys(changedFields).length === 0) {
      setError('No changes detected. Please modify at least one field to update.');
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post('/profile-update', changedFields);
      setSuccess(true);
      setEditData({});
      setShowEditModal(false);
      fetchMyRequests();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit profile update request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModalOpen = () => {
    setEditData({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      phone: user?.phone || '',
      address: user?.address || '',
      emergencyContactRelation: user?.emergencyContactRelation || '',
      emergencyContact: user?.emergencyContact || '',
      bloodGroup: user?.bloodGroup || '',
      nationality: user?.nationality || '',
      religion: user?.religion || '',
      parentRelation: user?.parentRelation || '',
      parentName: user?.parentName || '',
      parentPhone: user?.parentPhone || '',
      parentOccupation: user?.parentOccupation || '',
    });
    setShowEditModal(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/reset-password-request', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.data.message === 'Password updated successfully') {
        setSuccess(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccess(false);
        }, 2000);
      } else {
        setSuccess(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage and view your account details</p>
      </div>

      {/* Elegant Profile Header Card */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50 flex flex-col md:flex-row items-center gap-6 shadow-xs">
        <div className="relative">
          <UserAvatar
            profileImg={user?.profileImg}
            alt={user?.fullName || 'Profile'}
            size="xl"
            className="border-4 border-white shadow-md"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            {user?.fullName || 'N/A'}
          </h3>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <FiMail className="w-4 h-4 text-gray-400" />
              {user?.email || 'N/A'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden md:block"></span>
            <span className="text-xs font-bold tracking-wide uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md border border-blue-200">
              {user?.role || 'N/A'}
            </span>
            {user?.isActive && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-green-50 text-green-700 border border-green-100 uppercase">
                {user.isActive}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-3xs">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <FiUser className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEditModalOpen}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
              <FiEdit className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <FiLock className="w-4 h-4" />
              Change Password
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiUser className="w-4 h-4 text-gray-400" />
              Full Name
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">{user?.fullName || 'N/A'}</p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiMail className="w-4 h-4 text-gray-400" />
              Email
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">{user?.email || 'N/A'}</p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiShield className="w-4 h-4 text-gray-400" />
              Gender
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6 capitalize">{user?.gender?.toLowerCase() || 'N/A'}</p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              Date of Birth
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">
              {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiDroplet className="w-4 h-4 text-gray-400" />
              Blood Group
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">{user?.bloodGroup || 'N/A'}</p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiGlobe className="w-4 h-4 text-gray-400" />
              Nationality
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">{user?.nationality || 'N/A'}</p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiBriefcase className="w-4 h-4 text-gray-400" />
              Religion
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">{user?.religion || 'N/A'}</p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-gray-400" />
              Address
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">{user?.address || 'N/A'}</p>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 transition-all hover:bg-gray-50">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-gray-400" />
              Emergency Contact
            </label>
            <p className="text-sm font-semibold text-gray-800 mt-1.5 pl-6">
              {user?.emergencyContact ? `${user.emergencyContact} (${user.emergencyContactRelation || 'N/A'})` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setError(null);
                  setSuccess(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                <p className="font-semibold">Success!</p>
                <p className="text-sm mt-1">
                  {user?.role === 'ADMIN' 
                    ? 'Your password has been updated successfully.' 
                    : 'Your password change request has been sent to administrators for approval.'}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setError(null);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setError(null);
                  setEditData({});
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                <p className="font-semibold">Success!</p>
                <p className="text-sm mt-1">Your profile update request has been submitted for admin approval.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleProfileEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editData.firstname || ''}
                    onChange={(e) => setEditData({ ...editData, firstname: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editData.lastname || ''}
                    onChange={(e) => setEditData({ ...editData, lastname: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={editData.gender || ''}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={editData.dateOfBirth || ''}
                    onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                  <input
                    type="text"
                    value={editData.bloodGroup || ''}
                    onChange={(e) => setEditData({ ...editData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                  <input
                    type="text"
                    value={editData.nationality || ''}
                    onChange={(e) => setEditData({ ...editData, nationality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
                  <select
                    value={editData.religion || ''}
                    onChange={(e) => setEditData({ ...editData, religion: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={editData.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact Relation</label>
                  <input
                    type="text"
                    value={editData.emergencyContactRelation || ''}
                    onChange={(e) => setEditData({ ...editData, emergencyContactRelation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    value={editData.emergencyContact || ''}
                    onChange={(e) => setEditData({ ...editData, emergencyContact: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
              
              {/* Parent Information - only show for students */}
              {user?.role === 'STUDENT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Relation</label>
                    <select
                      value={editData.parentRelation || ''}
                      onChange={(e) => setEditData({ ...editData, parentRelation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    >
                      <option value="">Select Relation</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Name</label>
                    <input
                      type="text"
                      value={editData.parentName || ''}
                      onChange={(e) => setEditData({ ...editData, parentName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Phone</label>
                    <input
                      type="text"
                      value={editData.parentPhone || ''}
                      onChange={(e) => setEditData({ ...editData, parentPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Occupation</label>
                    <input
                      type="text"
                      value={editData.parentOccupation || ''}
                      onChange={(e) => setEditData({ ...editData, parentOccupation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setError(null);
                    setEditData({});
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
