import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { LuReceiptIndianRupee } from 'react-icons/lu';
import axiosInstance from '../../lib/axios';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface FeeUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  studentFeeId: string;
  feeType: 'TUITION' | 'SCHOOL';
  onSuccess: () => void;
}

export function FeeUpdateModal({
  isOpen,
  onClose,
  student,
  studentFeeId,
  feeType,
  onSuccess,
}: FeeUpdateModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    monthlyAmount: 0,
    annualFee: 0,
    examFee: 0,
    miscellaneousFee: 0,
    labFee: 0,
    discountPercentage: 0,
  });

  useEffect(() => {
    if (isOpen && studentFeeId) {
      fetchFeeDetails();
    }
  }, [isOpen, studentFeeId]);

  const fetchFeeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/student-fee/${studentFeeId}`);
      const fee = response.data.body;
      
      setFormData({
        monthlyAmount: fee.monthlyAmount || 0,
        annualFee: fee.annualFee || 0,
        examFee: fee.examFee || 0,
        miscellaneousFee: fee.miscellaneousFee || 0,
        labFee: fee.labFee || 0,
        discountPercentage: fee.discountPercentage || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData: any = {};
      
      if (feeType === 'TUITION') {
        updateData.monthlyAmount = formData.monthlyAmount;
      } else {
        updateData.annualFee = formData.annualFee;
        updateData.examFee = formData.examFee;
        updateData.miscellaneousFee = formData.miscellaneousFee;
        updateData.labFee = formData.labFee;
        updateData.discountPercentage = formData.discountPercentage;
      }

      await axiosInstance.patch(`/student-fee/${studentFeeId}`, updateData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update fee');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-enter border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <LuReceiptIndianRupee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Update Fees</h2>
              <p className="text-sm text-gray-500">{student.firstname} {student.lastname}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {feeType === 'TUITION' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyAmount}
                      onChange={(e) => setFormData({ ...formData, monthlyAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                    />
                  </div>
                </>
              )}

              {feeType === 'SCHOOL' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.annualFee}
                      onChange={(e) => setFormData({ ...formData, annualFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.examFee}
                      onChange={(e) => setFormData({ ...formData, examFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Miscellaneous Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.miscellaneousFee}
                      onChange={(e) => setFormData({ ...formData, miscellaneousFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lab Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.labFee}
                      onChange={(e) => setFormData({ ...formData, labFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
