import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiPrinter, FiArrowLeft, FiDownload } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';
import logo from '/logo.svg';

interface ReceiptData {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  month: string;
  monthIndex: number;
  status: string;
  acceptedBy?: string;
  reason?: string;
  notes?: string;
  studentFee: {
    id: string;
    feeType: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    student: {
      id: string;
      rollNumber?: string;
      classGrade?: string;
      section?: string;
      user: {
        email: string;
        phone?: string;
        firstname: string;
        lastname: string;
      };
    };
    academicYear: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
  };
}

export default function FeeReceipt() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const studentFeeId = searchParams.get('studentFeeId');
        const monthIndex = searchParams.get('monthIndex');
        const paymentId = searchParams.get('paymentId');

        let url = `/student-fee/receipt`;
        
        // If we have studentFeeId and monthIndex in query params, use those (tuition fee)
        if (studentFeeId && monthIndex) {
          url += `?studentFeeId=${studentFeeId}&monthIndex=${monthIndex}`;
        } 
        // Otherwise, if we have paymentId in query params, use that (school fee)
        else if (paymentId) {
          url += `?paymentId=${paymentId}`;
        } else {
          setError('Missing required parameters');
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(url);
        setReceiptData(response.data.body);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch receipt');
      } finally {
        setLoading(false);
      }
    };

    const studentFeeId = searchParams.get('studentFeeId');
    const monthIndex = searchParams.get('monthIndex');
    const paymentId = searchParams.get('paymentId');

    if (paymentId || (studentFeeId && monthIndex)) {
      fetchReceipt();
    } else {
      setLoading(false);
      setError('Missing required parameters');
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple HTML download
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const htmlContent = printContent.innerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const paymentId = searchParams.get('paymentId');
      const studentFeeId = searchParams.get('studentFeeId');
      const monthIndex = searchParams.get('monthIndex');
      const filename = paymentId ? `receipt-${paymentId}` : `receipt-${studentFeeId}-${monthIndex}`;
      a.download = `${filename}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receiptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Receipt not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Control Buttons - Hidden during print */}
      <div className="max-w-3xl mx-auto mb-6 no-print">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPrinter className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div id="receipt-content" className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3">
          <div className="flex justify-between items-center">
            {/* Left section - Logo and Receipt title */}
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Bright Academy Logo"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h2 className="text-xl font-bold">RECEIPT</h2>
                <p className="text-blue-100 text-xs">Official Payment Document</p>
              </div>
            </div>
            {/* Right section - School info */}
            <div className="flex-1 text-right">
              <h1 className="text-base font-bold mb-0.5">Bright Educational Academy</h1>
              <p className="text-blue-100 text-xs">Excellence in Education</p>
            </div>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="p-3">
          {/* Receipt Number and Date */}
          <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Receipt Number</p>
              <p className="text-xs font-semibold text-gray-900">{receiptData.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Payment Date</p>
              <p className="text-xs font-semibold text-gray-900">{formatDate(receiptData.paymentDate)}</p>
            </div>
          </div>

          {/* Student Information */}
          <div className="mb-3 pb-2 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-900 mb-1.5">Student Information</h2>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <p className="text-xs text-gray-500">Student Name</p>
                <p className="text-xs font-semibold text-gray-900">
                  {receiptData.studentFee.student.user.firstname} {receiptData.studentFee.student.user.lastname}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Roll Number</p>
                <p className="text-xs font-semibold text-gray-900">{receiptData.studentFee.student.rollNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Class</p>
                <p className="text-xs font-semibold text-gray-900">
                  {receiptData.studentFee.student.classGrade || 'N/A'} - {receiptData.studentFee.student.section || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-xs font-semibold text-gray-900">{receiptData.studentFee.student.user.email}</p>
              </div>
            </div>
          </div>

          {/* Academic Year */}
          <div className="mb-3 pb-2 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-900 mb-1.5">Academic Year</h2>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <p className="text-xs text-gray-500">Academic Year</p>
                <p className="text-xs font-semibold text-gray-900">{receiptData.studentFee.academicYear.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fee Type</p>
                <p className="text-xs font-semibold text-gray-900">{receiptData.studentFee.feeType}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-3 pb-2 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-900 mb-1.5">Payment Details</h2>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Payment For</span>
                <span className="text-xs font-semibold text-gray-900">{receiptData.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Payment Method</span>
                <span className="text-xs font-semibold text-gray-900">{receiptData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Status</span>
                <span className="text-xs font-semibold text-green-600">{receiptData.status}</span>
              </div>
              {(receiptData as any).acceptedByName && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Accepted By</span>
                  <span className="text-xs font-semibold text-gray-900">{(receiptData as any).acceptedByName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="mb-3 pb-2 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-900 mb-1.5">Amount Details</h2>
            <div className="space-y-1.5">
              {receiptData.studentFee.feeType === 'TUITION' ? (
                // Simplified breakdown for tuition fees
                <>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900">Fee for {receiptData.month}</span>
                    <span className="text-blue-600">{formatAmount(receiptData.amount)}</span>
                  </div>
                </>
              ) : (
                // Full breakdown for school fees
                <>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Total Fee Amount</span>
                    <span className="text-xs font-semibold text-gray-900">{formatAmount(receiptData.studentFee.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Previously Paid</span>
                    <span className="text-xs font-semibold text-gray-900">{formatAmount(receiptData.studentFee.paidAmount - receiptData.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900">This Payment</span>
                    <span className="text-blue-600">{formatAmount(receiptData.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-gray-200">
                    <span className="text-gray-900">Remaining Balance</span>
                    <span className="text-gray-900">{formatAmount(receiptData.studentFee.balanceAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {receiptData.notes && (
            <div className="mb-3 pb-2 border-b border-gray-200">
              <h2 className="text-xs font-bold text-gray-900 mb-1.5">Notes</h2>
              <p className="text-xs text-gray-600">{receiptData.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-500 text-xs">
            <p className="mb-0.5">This is a computer-generated receipt and does not require a signature.</p>
            <p>Thank you for your payment!</p>
          </div>

          {/* Signature and Stamp Section */}
          <div className="mt-4 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-end">
              <div className="text-center">
                <div className="h-12 mb-0.5"></div>
                <p className="text-xs text-gray-600">Administrator Signature</p>
              </div>
              <div className="text-center">
                <div className="h-12 mb-0.5"></div>
                <p className="text-xs text-gray-600">Official Stamp</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-gray-50 px-3 py-1.5 text-center text-xs text-gray-500">
          <p>For any queries, please contact the school administration.</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          #receipt-content {
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
}
