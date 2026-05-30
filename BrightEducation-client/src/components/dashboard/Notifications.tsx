import { useState, useEffect } from 'react';
import { FiClock, FiAlertCircle, FiInfo, FiCheck, FiTrash2, FiThumbsUp, FiThumbsDown, FiRefreshCw } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';
import ToastModal from '../common/ToastModal';
import { useAppSelector } from '../../store/hooks';

interface Notification {
  id: string;
  type: string;
  status: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  processedAt?: string;
  user: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
  relatedUser?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
  processor?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
  data?: any;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'>('ALL');
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

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter !== 'ALL' ? `?status=${filter}` : '';
      const response = await axiosInstance.get(`/notifications${params}`);
      setNotifications(response.data.data);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      setToastModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to mark notification as read',
        showConfirm: false,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setToastModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'All notifications marked as read',
        showConfirm: false,
      });
    } catch (error) {
      setToastModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to mark all notifications as read',
        showConfirm: false,
      });
    }
  };

  const handleDelete = (id: string) => {
    setToastModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      showConfirm: true,
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/notifications/${id}`);
          setNotifications(notifications.filter(n => n.id !== id));
          setToastModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Notification deleted successfully',
            showConfirm: false,
          });
        } catch (error) {
          setToastModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete notification',
            showConfirm: false,
          });
        }
      },
    });
  };

  const handleApproveReject = async (notificationId: string, action: 'approve' | 'reject') => {
    try {
      await axiosInstance.post('/auth/approve-password-reset', {
        notificationId,
        action,
      });
      setNotifications(notifications.map(n => 
        n.id === notificationId 
          ? { ...n, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
          : n
      ));
      setToastModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `Password reset request ${action === 'approve' ? 'approved' : 'rejected'}`,
        showConfirm: false,
      });
    } catch (error) {
      setToastModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to ${action} password reset request`,
        showConfirm: false,
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PASSWORD_CHANGE':
        return <FiAlertCircle className="w-5 h-5 text-amber-500" />;
      case 'PROFILE_UPDATE':
        return <FiInfo className="w-5 h-5 text-blue-500" />;
      case 'LOGIN_ALERT':
        return <FiClock className="w-5 h-5 text-purple-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-600';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-600';
      case 'HIGH':
        return 'bg-orange-100 text-orange-600';
      case 'URGENT':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
        <p className="text-gray-500 mt-1">View and manage your notifications</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={fetchNotifications}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh notifications"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FiInfo className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {formatTime(notification.createdAt)}
                      </span>
                      {notification.processor && (
                        <span>
                          Processed by: {notification.processor.firstname} {notification.processor.lastname}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Show approve/reject buttons for admins on pending password change notifications */}
                    {user?.role === 'ADMIN' && 
                     notification.type === 'PASSWORD_CHANGE' && 
                     notification.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveReject(notification.id, 'approve')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <FiThumbsUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleApproveReject(notification.id, 'reject')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <FiThumbsDown className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default Notifications;
