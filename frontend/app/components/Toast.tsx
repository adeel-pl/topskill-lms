'use client';

import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastComponent = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="w-5 h-5" />,
    error: <FiXCircle className="w-5 h-5" />,
    warning: <FiAlertCircle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />,
  };

  const colors = {
    success: {
      bg: 'bg-[#366854]',
      border: 'border-[#366854]',
      icon: 'text-white',
    },
    error: {
      bg: 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]',
      border: 'border-[#EF4444]',
      icon: 'text-white',
    },
    warning: {
      bg: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]',
      border: 'border-[#F59E0B]',
      icon: 'text-white',
    },
    info: {
      bg: 'bg-[#366854]',
      border: 'border-[#3B82F6]',
      icon: 'text-white',
    },
  };

  const colorScheme = colors[toast.type];

  return (
    <div
      className={`
        ${colorScheme.bg}
        ${colorScheme.border}
        border-2
        rounded-xl
        shadow-2xl
        p-4
        mb-3
        min-w-[320px]
        max-w-[500px]
        backdrop-blur-sm
        animate-slide-in-right
        flex
        items-center
        gap-3
        relative
        overflow-hidden
        group
        hover:scale-[1.02]
        transition-transform
        duration-200
      `}
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon - Fixed on left */}
      <div className={`${colorScheme.icon} flex-shrink-0`}>
        {icons[toast.type]}
      </div>

      {/* Message - Takes remaining space */}
      <div className="flex-1 text-white min-w-0">
        <p className="font-semibold text-sm leading-relaxed break-words">{toast.message}</p>
      </div>

      {/* Close button - Fixed on right */}
      <button
        onClick={() => onClose(toast.id)}
        className={`
          ${colorScheme.icon}
          hover:bg-white/20
          rounded-lg
          p-1.5
          transition-colors
          flex-shrink-0
          opacity-70
          hover:opacity-100
          ml-2
        `}
        aria-label="Close notification"
      >
        <FiX className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white/40 animate-shrink"
          style={{
            animation: `shrink ${toast.duration || 5000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-[9999] flex flex-col items-end pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

