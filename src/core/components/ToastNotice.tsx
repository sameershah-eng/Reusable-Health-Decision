import React from 'react';
import { useUIStore } from '../../state/uiStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotice: React.FC = () => {
  const { toast, clearToast } = useUIStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-600" />,
    info: <Info className="w-4 h-4 text-[#E07A6B]" />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 z-50 animate-fadeIn"
    >
      <div className="flex items-center gap-3 py-3 px-4 bg-white border border-[#EDE6DF] rounded-2xl shadow-xl text-xs sm:text-sm text-[#2B2233] max-w-sm">
        {icons[toast.type]}
        <span className="leading-snug">{toast.message}</span>
        <button
          onClick={clearToast}
          aria-label="Dismiss notification"
          className="text-[#8C8294] hover:text-[#2B2233] p-1 rounded-md cursor-pointer ml-auto"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
