import { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiClock, FiXCircle, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import { LuReceiptIndianRupee } from 'react-icons/lu';
import axiosInstance from '../../lib/axios';

interface MonthWiseBreakdown {
  monthIndex: number;
  monthName: string;
  startDate: string;
  endDate: string;
  days: number;
  amount: number;
  isPartial: boolean;
  status?: 'PENDING' | 'PAID' | 'PAUSED' | 'WAIVED_OFF';
  reason?: string;
}

interface FeeComponent {
  name: string;
  amount: number;
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  acceptedBy?: string;
  reason?: string;
  notes?: string;
}

interface FeeCalculation {
  feeType?: 'TUITION' | 'SCHOOL';
  enrollmentDate?: string;
  academicYearStart?: string;
  academicYearEnd?: string;
  monthlyAmount?: number;
  totalMonths?: number;
  extraDays?: number;
  fullMonthsAmount?: number;
  extraDaysAmount?: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  monthWiseBreakdown?: MonthWiseBreakdown[];
  annualFee?: number;
  examFee?: number;
  miscellaneousFee?: number;
  labFee?: number;
  feeComponents?: FeeComponent[];
  paymentHistory?: PaymentHistory[];
}

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface FeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  studentFeeId: string;
  academicYearName: string;
  feeType?: 'TUITION' | 'SCHOOL';
}

export function FeeDetailsModal({
  isOpen,
  onClose,
  student,
  studentFeeId,
  academicYearName,
  feeType = 'TUITION',
}: FeeDetailsModalProps) {
  const [feeCalculation, setFeeCalculation] = useState<FeeCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managementUsers, setManagementUsers] = useState<any[]>([]);
  const [editingMonth, setEditingMonth] = useState<MonthWiseBreakdown | null>(null);
  const [paymentType, setPaymentType] = useState('CASH');
  const [acceptedBy, setAcceptedBy] = useState('');
  const [feeStatus, setFeeStatus] = useState<'PENDING' | 'PAID' | 'PAUSED' | 'WAIVED_OFF'>('PENDING');
  const [reason, setReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false);
  const [selectedPaymentForDelete, setSelectedPaymentForDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteReasonType, setDeleteReasonType] = useState('MISTAKENLY_ADDED');
  const [deletedBy, setDeletedBy] = useState('');
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false);
  const [selectedPaymentForView, setSelectedPaymentForView] = useState<MonthWiseBreakdown | null>(null);

  useEffect(() => {
    if (isOpen && studentFeeId) {
      fetchFeeCalculation();
      fetchManagementUsers();
    }
  }, [isOpen, studentFeeId]);

  const fetchManagementUsers = async () => {
    try {
      const response = await axiosInstance.get('/user/all?role=MANAGEMENT&limit=1000');
      setManagementUsers(response.data.body?.users || []);
    } catch (error) {
      console.error('Failed to fetch management users:', error);
    }
  };

  const fetchFeeCalculation = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = feeType === 'SCHOOL' 
        ? `/student-fee/${studentFeeId}/calculate-school`
        : `/student-fee/${studentFeeId}/calculate`;
      const response = await axiosInstance.get(endpoint);
      setFeeCalculation(response.data.body);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMonth = (month: MonthWiseBreakdown) => {
    setEditingMonth(month);
    setPaymentType('CASH'); // Default payment type
    setAcceptedBy('');
    setFeeStatus(month.status || 'PENDING');
    setReason(month.reason || '');
  };

  const handleSaveMonth = async () => {
    try {
      const response = await axiosInstance.post('/student-fee/payment', {
        studentFeeId,
        month: editingMonth.monthName,
        monthIndex: editingMonth.monthIndex,
        amount: editingMonth.amount,
        paymentMethod: paymentType,
        status: feeStatus,
        acceptedBy: acceptedBy || null,
        reason: reason || null,
      });

      console.log('Payment saved successfully:', response.data);
      
      // Refresh fee calculation
      await fetchFeeCalculation();
      
      setEditingMonth(null);
      setPaymentType('');
      setAcceptedBy('');
      setFeeStatus('PENDING');
      setReason('');
    } catch (error) {
      console.error('Failed to save payment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMonth(null);
    setPaymentType('');
    setAcceptedBy('');
    setFeeStatus('PENDING');
    setReason('');
  };

  const handleRecordPayment = async () => {
    try {
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      const response = await axiosInstance.post('/student-fee/payment', {
        studentFeeId,
        month: 'Partial Payment',
        monthIndex: 0,
        amount,
        paymentMethod: paymentType,
        status: 'PAID',
        acceptedBy: acceptedBy || null,
        reason: null,
      });

      console.log('Payment saved successfully:', response.data);
      
      // Refresh fee calculation
      await fetchFeeCalculation();
      
      setIsRecordingPayment(false);
      setPaymentAmount('');
      setPaymentType('CASH');
      setAcceptedBy('');
    } catch (error) {
      console.error('Failed to save payment:', error);
    }
  };

  const handleViewPaymentDetails = (month: MonthWiseBreakdown) => {
    setSelectedPaymentForView(month);
    setIsViewPaymentModalOpen(true);
  };

  const handleDeletePayment = (month: MonthWiseBreakdown) => {
    setSelectedPaymentForDelete(month);
    setIsDeletePaymentModalOpen(true);
    setDeleteReason('');
    setDeleteReasonType('MISTAKENLY_ADDED');
    setDeletedBy('');
  };

  const handleViewSchoolPaymentDetails = (payment: PaymentHistory) => {
    setSelectedPaymentForView(payment as any);
    setIsViewPaymentModalOpen(true);
  };

  const handleDeleteSchoolPayment = (payment: PaymentHistory) => {
    setSelectedPaymentForDelete(payment as any);
    setIsDeletePaymentModalOpen(true);
    setDeleteReason('');
    setDeleteReasonType('MISTAKENLY_ADDED');
    setDeletedBy('');
  };

  const handleConfirmDeletePayment = async () => {
    try {
      if (!selectedPaymentForDelete) return;

      // Check if it's a tuition payment (has monthIndex) or school payment (has id)
      const paymentId = selectedPaymentForDelete.id;
      const monthIndex = selectedPaymentForDelete.monthIndex;

      await axiosInstance.delete(`/student-fee/payment/${studentFeeId}`, {
        data: {
          paymentId,
          monthIndex,
          reasonType: deleteReasonType,
          reason: deleteReason,
          deletedBy: deletedBy,
        },
      });

      // Refresh fee calculation
      await fetchFeeCalculation();
      
      setIsDeletePaymentModalOpen(false);
      setSelectedPaymentForDelete(null);
      setDeleteReason('');
      setDeleteReasonType('MISTAKENLY_ADDED');
      setDeletedBy('');
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-modal-enter border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <LuReceiptIndianRupee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Fee Details</h2>
              <p className="text-sm text-gray-500">
                {student.firstname} {student.lastname} — {academicYearName}
              </p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : feeCalculation ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <LuReceiptIndianRupee className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600 uppercase">Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{feeCalculation.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600 uppercase">Paid Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{feeCalculation.paidAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50/80 rounded-xl p-4 border border-red-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiXCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-600 uppercase">Balance Due</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{feeCalculation.balanceAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50/80 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiClock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600 uppercase">Status</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {feeCalculation.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Calculation Details - Only for TUITION fees */}
              {feeType === 'TUITION' && (
                <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enrollment Date:</span>
                      <span className="font-medium">
                        {new Date(feeCalculation.enrollmentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Academic Year:</span>
                      <span className="font-medium">
                        {new Date(feeCalculation.academicYearStart).toLocaleDateString()} - {new Date(feeCalculation.academicYearEnd).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Amount:</span>
                      <span className="font-medium">₹{feeCalculation.monthlyAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Months:</span>
                      <span className="font-medium">{feeCalculation.totalMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extra Days:</span>
                      <span className="font-medium">{feeCalculation.extraDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Months Amount:</span>
                      <span className="font-medium">₹{feeCalculation.fullMonthsAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extra Days Amount:</span>
                      <span className="font-medium">₹{feeCalculation.extraDaysAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Components - Only for SCHOOL fees */}
              {feeType === 'SCHOOL' && feeCalculation.feeComponents && (
                <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Components</h3>
                  <div className="space-y-2">
                    {feeCalculation.feeComponents.map((component, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{component.name}:</span>
                        <span className="font-medium">₹{component.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Month-wise Breakdown Table - Only for TUITION fees */}
              {feeType === 'TUITION' && feeCalculation.monthWiseBreakdown && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Month-wise Fee Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fees Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {feeCalculation.monthWiseBreakdown.map((month) => (
                        <tr key={month.monthIndex} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {month.monthIndex}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {month.monthName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(month.startDate).toLocaleDateString()} - {new Date(month.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {month.days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                            ₹{month.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {month.isPartial ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Partial
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Full
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {(() => {
                              const status = month.status || 'PENDING';
                              const statusColors = {
                                PENDING: 'bg-gray-100 text-gray-700',
                                PAID: 'bg-green-100 text-green-700',
                                PAUSED: 'bg-orange-100 text-orange-700',
                                WAIVED_OFF: 'bg-blue-100 text-blue-700',
                              };
                              return (
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
                                  {status.replace('_', ' ')}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {month.status === 'PAID' ? (
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleViewPaymentDetails(month)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePayment(month)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Payment"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditMonth(month)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Record Payment"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-right text-gray-900">
                          ₹{feeCalculation.totalAmount.toLocaleString()}
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              )}

              {/* Payment History - Only for SCHOOL fees */}
              {feeType === 'SCHOOL' && feeCalculation.paymentHistory && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                    <button
                      onClick={() => setIsRecordingPayment(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
                    >
                      Record Payment
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feeCalculation.paymentHistory.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-sm text-gray-500 text-center">
                              No payments recorded yet
                            </td>
                          </tr>
                        ) : (
                          feeCalculation.paymentHistory.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(payment.paymentDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{payment.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.paymentMethod || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => handleViewSchoolPaymentDetails(payment)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Details"
                                  >
                                    <FiEye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchoolPayment(payment)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Payment"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Payment Recording Modal for TUITION fees */}
      {editingMonth && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-enter border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <p className="text-sm text-gray-900 font-medium">{editingMonth.monthName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <p className="text-sm text-gray-900 font-medium">₹{editingMonth.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fees Status</label>
                <select
                  value={feeStatus}
                  onChange={(e) => setFeeStatus(e.target.value as 'PENDING' | 'PAID' | 'PAUSED' | 'WAIVED_OFF')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PAUSED">Paused</option>
                  <option value="WAIVED_OFF">Waived Off</option>
                </select>
              </div>
              {(feeStatus === 'PAUSED' || feeStatus === 'WAIVED_OFF') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for pausing or waiving off..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  />
                </div>
              )}
              {feeStatus === 'PAID' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accepted By</label>
                    <select
                      value={acceptedBy}
                      onChange={(e) => setAcceptedBy(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                    >
                      <option value="">Select Management User</option>
                      {managementUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstname} {user.lastname}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 p-5 border-t border-gray-100">
              <button
                onClick={handleCancelEdit}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMonth}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Recording Modal for SCHOOL fees */}
      {isRecordingPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-enter border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <button
                onClick={() => setIsRecordingPayment(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
                <p className="text-sm text-gray-900 font-medium">₹{feeCalculation?.balanceAmount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accepted By</label>
                <select
                  value={acceptedBy}
                  onChange={(e) => setAcceptedBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                >
                  <option value="">Select Management User</option>
                  {managementUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstname} {user.lastname}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setIsRecordingPayment(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Modal */}
      {isDeletePaymentModalOpen && selectedPaymentForDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-enter border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Delete Payment</h3>
              <button
                onClick={() => setIsDeletePaymentModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-800">
                  {selectedPaymentForDelete.monthName ? (
                    <>You are about to delete the payment for <strong>{selectedPaymentForDelete.monthName}</strong> of ₹{selectedPaymentForDelete.amount.toLocaleString()}.</>
                  ) : (
                    <>You are about to delete the payment of ₹{selectedPaymentForDelete.amount.toLocaleString()} made on <strong>{new Date(selectedPaymentForDelete.paymentDate).toLocaleDateString()}</strong>.</>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Deletion</label>
                <select
                  value={deleteReasonType}
                  onChange={(e) => setDeleteReasonType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                >
                  <option value="MISTAKENLY_ADDED">Mistakenly Added</option>
                  <option value="WRONG_STUDENT">Wrong Student Added</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Reason</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Provide additional details..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deleted By</label>
                <select
                  value={deletedBy}
                  onChange={(e) => setDeletedBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                >
                  <option value="">Select Management User</option>
                  {managementUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstname} {user.lastname}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setIsDeletePaymentModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePayment}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Details Modal */}
      {isViewPaymentModalOpen && selectedPaymentForView && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-modal-enter border border-gray-100">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button
                onClick={() => setIsViewPaymentModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4">
                <div className="space-y-3">
                  {/* Check if it's a tuition payment (MonthWiseBreakdown) or school payment (PaymentHistory) */}
                  {'monthName' in selectedPaymentForView ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Month:</span>
                        <span className="text-sm text-gray-900">{(selectedPaymentForView as any).monthName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Amount:</span>
                        <span className="text-sm font-bold text-gray-900">₹{(selectedPaymentForView as any).amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className="text-sm text-gray-900">{(selectedPaymentForView as any).status || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Type:</span>
                        <span className="text-sm text-gray-900">{(selectedPaymentForView as any).isPartial ? 'Partial' : 'Full'}</span>
                      </div>
                      {(selectedPaymentForView as any).reason && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Reason:</span>
                          <span className="text-sm text-gray-900">{(selectedPaymentForView as any).reason}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Period:</span>
                        <span className="text-sm text-gray-900">
                          {new Date((selectedPaymentForView as any).startDate).toLocaleDateString()} - {new Date((selectedPaymentForView as any).endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Days:</span>
                        <span className="text-sm text-gray-900">{(selectedPaymentForView as any).days}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Payment Date:</span>
                        <span className="text-sm text-gray-900">{new Date((selectedPaymentForView as any).paymentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Amount:</span>
                        <span className="text-sm font-bold text-gray-900">₹{(selectedPaymentForView as any).amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                        <span className="text-sm text-gray-900">{(selectedPaymentForView as any).paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className="text-sm text-gray-900">{(selectedPaymentForView as any).status || 'N/A'}</span>
                      </div>
                      {(selectedPaymentForView as any).acceptedBy && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Accepted By:</span>
                          <span className="text-sm text-gray-900">
                            {managementUsers.find((user) => user.id === (selectedPaymentForView as any).acceptedBy)?.firstname || ''} {managementUsers.find((user) => user.id === (selectedPaymentForView as any).acceptedBy)?.lastname || ''}
                          </span>
                        </div>
                      )}
                      {(selectedPaymentForView as any).reason && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Reason:</span>
                          <span className="text-sm text-gray-900">{(selectedPaymentForView as any).reason}</span>
                        </div>
                      )}
                      {(selectedPaymentForView as any).notes && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">Notes:</span>
                          <span className="text-sm text-gray-900">{(selectedPaymentForView as any).notes}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              {/* Show View Receipt button for paid payments only */}
              {(selectedPaymentForView as any).status === 'PAID' && (
                <button
                  onClick={() => {
                    // Check if it's a school payment (has id) or tuition payment (has monthIndex)
                    if ('monthName' in selectedPaymentForView) {
                      // Tuition payment - use only query params
                      const monthIndex = (selectedPaymentForView as any).monthIndex;
                      window.open(`/receipt?studentFeeId=${studentFeeId}&monthIndex=${monthIndex}`, '_blank');
                    } else {
                      // School payment - use payment id as query param
                      const paymentId = (selectedPaymentForView as any).id;
                      window.open(`/receipt?paymentId=${paymentId}`, '_blank');
                    }
                  }}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  View Receipt
                </button>
              )}
              <button
                onClick={() => setIsViewPaymentModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
