import React, { useState, useEffect } from 'react';
import { FiPlus, FiCalendar, FiUsers, FiBookOpen, FiEdit2, FiTrash2, FiPower, FiCheckCircle, FiX } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';
import ToastModal from '../common/ToastModal';
import { useAppSelector } from '../../store/hooks';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcademicYearDetailProps {
  academicYear: AcademicYear;
  onClose: () => void;
  onUpdate: () => void;
}

const AcademicYear: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastModal, setToastModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm';
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

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/academic-year');
      setAcademicYears(response.data.body || []);
    } catch (error) {
      setToastModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch academic years',
        showConfirm: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateYear = () => {
    setIsCreateModalOpen(true);
  };

  const handleCardClick = (year: AcademicYear) => {
    setSelectedYear(year);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Academic Year</h1>
        {isAdmin && (
          <button
            onClick={handleCreateYear}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Create Academic Year
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : academicYears.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No academic years found</p>
          {isAdmin && (
            <button
              onClick={handleCreateYear}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Academic Year
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {academicYears.map((year) => (
            <div
              key={year.id}
              onClick={() => handleCardClick(year)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${year.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <FiCalendar className={`w-6 h-6 ${year.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{year.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        year.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {year.isActive ? (
                        <>
                          <FiCheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        'Inactive'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium text-gray-700">{formatDate(year.startDate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">End Date</span>
                  <span className="font-medium text-gray-700">{formatDate(year.endDate)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <FiBookOpen className="w-4 h-4" />
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <p className="text-xs text-gray-500">Classes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <FiUsers className="w-4 h-4" />
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <FiUsers className="w-4 h-4" />
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <p className="text-xs text-gray-500">Teachers</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedYear && (
        <AcademicYearDetail
          academicYear={selectedYear}
          onClose={() => setSelectedYear(null)}
          onUpdate={fetchAcademicYears}
        />
      )}

      {isCreateModalOpen && (
        <CreateAcademicYearModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchAcademicYears}
        />
      )}

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

const AcademicYearDetail: React.FC<AcademicYearDetailProps> = ({ academicYear, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: academicYear.name,
    startDate: academicYear.startDate.split('T')[0],
    endDate: academicYear.endDate.split('T')[0],
  });
  const [toastModal, setToastModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm';
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

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';

  const handleSave = async () => {
    try {
      await axiosInstance.put(`/academic-year/${academicYear.id}`, editData);
      setIsEditing(false);
      onUpdate();
      onClose();
      setToastModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Academic year updated successfully',
        showConfirm: false,
      });
    } catch (error) {
      setToastModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update academic year',
        showConfirm: false,
      });
    }
  };

  const handleActivate = async () => {
    try {
      await axiosInstance.patch(`/academic-year/${academicYear.id}/activate`);
      onUpdate();
      onClose();
      setToastModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Academic year activated successfully',
        showConfirm: false,
      });
    } catch (error) {
      setToastModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to activate academic year',
        showConfirm: false,
      });
    }
  };

  const handleDeactivate = async () => {
    try {
      await axiosInstance.patch(`/academic-year/${academicYear.id}/deactivate`);
      onUpdate();
      onClose();
      setToastModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Academic year deactivated successfully',
        showConfirm: false,
      });
    } catch (error) {
      setToastModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to deactivate academic year',
        showConfirm: false,
      });
    }
  };

  const handleDelete = () => {
    setToastModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Academic Year',
      message: 'Are you sure you want to delete this academic year? This action cannot be undone.',
      showConfirm: true,
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/academic-year/${academicYear.id}`);
          // Dispatch event to refresh sidebar
          window.dispatchEvent(new Event('academic-year-refresh'));
          onUpdate();
          onClose();
          setToastModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Academic year deleted successfully',
            showConfirm: false,
          });
        } catch (error) {
          setToastModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete academic year',
            showConfirm: false,
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Academic Year Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-800 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={editData.startDate}
                  onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-800 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={editData.endDate}
                  onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-800 transition-all shadow-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-4 rounded-xl ${academicYear.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <FiCalendar className={`w-8 h-8 ${academicYear.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{academicYear.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${
                      academicYear.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {academicYear.isActive ? (
                      <>
                        <FiCheckCircle className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      'Inactive'
                    )}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(academicYear.startDate)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(academicYear.endDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <FiBookOpen className="w-5 h-5" />
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <p className="text-sm text-gray-600">Classes</p>
                </div>
                <div className="text-center bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <FiUsers className="w-5 h-5" />
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
                <div className="text-center bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <FiUsers className="w-5 h-5" />
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <p className="text-sm text-gray-600">Teachers</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      name: academicYear.name,
                      startDate: academicYear.startDate.split('T')[0],
                      endDate: academicYear.endDate.split('T')[0],
                    });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                {academicYear.isActive ? (
                  <button
                    onClick={handleDeactivate}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    <FiPower className="w-4 h-4" />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={handleActivate}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        )}

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
    </div>
  );
};

interface CreateAcademicYearModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAcademicYearModal: React.FC<CreateAcademicYearModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate each field with specific error messages
    const missingFields = [];
    if (!formData.name) missingFields.push('Name');
    if (!formData.startDate) missingFields.push('Start Date');
    if (!formData.endDate) missingFields.push('End Date');
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required field(s): ${missingFields.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/academic-year', formData);
      setSuccess(true);
      // Dispatch event to refresh sidebar
      window.dispatchEvent(new Event('academic-year-refresh'));
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create academic year');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create Academic Year</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Academic year created successfully!
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., 2025-2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicYear;
