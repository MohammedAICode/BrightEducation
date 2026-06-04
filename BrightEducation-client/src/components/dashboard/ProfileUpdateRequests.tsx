import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiUser, FiMail, FiClock, FiAlertCircle, FiImage } from 'react-icons/fi';
import axiosInstance, { getProfileImageUrl } from '../../lib/axios';
import { useAppSelector } from '../../store/hooks';

interface ProfileUpdateRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
  approvedBy: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  } | null;
  // Update fields
  firstname?: string;
  lastname?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  emergencyContactRelation?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  parentRelation?: string;
  parentName?: string;
  parentPhone?: string;
  parentOccupation?: string;
  profileImgKey?: string;
}

const ProfileUpdateRequests: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user) as any;
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ProfileUpdateRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/profile-update', {
        params: filter !== 'ALL' ? { status: filter } : undefined,
      });
      setRequests(response.data.body || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await axiosInstance.put(`/profile-update/${requestId}/approve`);
      setSuccess('Request approved successfully');
      fetchRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await axiosInstance.put(`/profile-update/${selectedRequest.id}/reject`, {
        rejectionReason,
      });
      setSuccess('Request rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangedFields = (request: ProfileUpdateRequest) => {
    const fields: string[] = [];
    if (request.firstname) fields.push('First Name');
    if (request.lastname) fields.push('Last Name');
    if (request.gender) fields.push('Gender');
    if (request.dateOfBirth) fields.push('Date of Birth');
    if (request.phone) fields.push('Phone');
    if (request.address) fields.push('Address');
    if (request.emergencyContactRelation) fields.push('Emergency Contact Relation');
    if (request.emergencyContact) fields.push('Emergency Contact');
    if (request.bloodGroup) fields.push('Blood Group');
    if (request.nationality) fields.push('Nationality');
    if (request.religion) fields.push('Religion');
    if (request.parentRelation) fields.push('Parent Relation');
    if (request.parentName) fields.push('Parent Name');
    if (request.parentPhone) fields.push('Parent Phone');
    if (request.parentOccupation) fields.push('Parent Occupation');
    if (request.profileImgKey) fields.push('Profile Image');
    return fields;
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Access Denied. Only administrators can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Update Requests</h1>
        <p className="text-gray-500 mt-1">Review and approve or reject profile update requests from users</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No profile update requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-3xs">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {request.user.firstname} {request.user.lastname}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiMail className="w-4 h-4" />
                      {request.user.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-blue-100 text-blue-800 uppercase">
                        {request.user.role}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md border uppercase ${getStatusColor(request.status)}">
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Requested Changes:</p>
                <div className="flex flex-wrap gap-2">
                  {getChangedFields(request).map((field) => (
                    <span key={field} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              {request.profileImgKey && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">New Profile Image:</p>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const imageUrl = getProfileImageUrl(request.profileImgKey);
                      return imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt="New profile" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    <div className="hidden w-16 h-16 rounded-full bg-blue-200 items-center justify-center border-2 border-blue-300">
                      <FiImage className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700">User has uploaded a new profile picture</p>
                  </div>
                </div>
              )}

              {request.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{request.rejectionReason}</p>
                </div>
              )}

              {request.approvedBy && (
                <div className="mb-4 text-sm text-gray-500">
                  Processed by: {request.approvedBy.firstname} {request.approvedBy.lastname}
                </div>
              )}

              {request.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  >
                    <FiCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                  >
                    <FiX className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Reject Request</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason (Optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Why are you rejecting this request?"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileUpdateRequests;
