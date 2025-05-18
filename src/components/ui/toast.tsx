import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div
      className={cn(
        "w-full p-4 rounded-lg shadow-sm flex items-center gap-3",
        type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      )}
    >
      <div className={cn(
        "flex-1",
        type === 'success' ? 'text-green-800' : 'text-red-800'
      )}>
        <p className="font-medium">{type === 'success' ? 'Success' : 'Mismatched'}</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "p-1 rounded-full hover:bg-opacity-20",
            type === 'success' ? 'hover:bg-green-800' : 'hover:bg-red-800'
          )}
        >
          <X className={cn(
            "h-4 w-4",
            type === 'success' ? 'text-green-800' : 'text-red-800'
          )} />
        </button>
      )}
    </div>
  );
};

export default Toast;
