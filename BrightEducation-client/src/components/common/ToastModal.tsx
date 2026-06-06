import { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface ToastModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: ToastType;
  showConfirm?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const ToastModal: React.FC<ToastModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showConfirm = false,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoClose && !showConfirm) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoClose, showConfirm, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const getIconWithBg = () => {
    switch (type) {
      case 'success':
        return <div className="p-2.5 rounded-xl bg-green-50 border border-green-100"><FiCheckCircle className="w-6 h-6 text-green-500" /></div>;
      case 'warning':
        return <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100"><FiAlertTriangle className="w-6 h-6 text-amber-500" /></div>;
      case 'error':
        return <div className="p-2.5 rounded-xl bg-red-50 border border-red-100"><FiAlertCircle className="w-6 h-6 text-red-500" /></div>;
      case 'confirm':
        return <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100"><FiAlertCircle className="w-6 h-6 text-blue-500" /></div>;
      default:
        return <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100"><FiInfo className="w-6 h-6 text-blue-500" /></div>;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'warning':
        return 'border-amber-200';
      case 'error':
        return 'border-red-200';
      case 'confirm':
        return 'border-blue-200';
      default:
        return 'border-blue-200';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border ${getBorderColor()} transition-all duration-200 transform ${
          isVisible ? 'scale-100 opacity-100 animate-modal-enter' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Icon and Content */}
        <div className="flex items-start gap-4">
          <div className="shrink-0">{getIconWithBg()}</div>
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
            )}
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {showConfirm && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 ${getConfirmButtonColor()}`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToastModal;
