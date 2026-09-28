import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Soft backdrop */}
      <div
        className="fixed inset-0 bg-[#2B2233]/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        className={`relative w-full ${maxWidthStyles} bg-[#FBF8F4] border border-[#E8DFD8] rounded-[24px] shadow-[0_20px_60px_rgba(43,34,51,0.15)] overflow-hidden my-auto max-h-[90vh] flex flex-col z-10 transition-all`}
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#EDE6DF] bg-white">
          {title ? (
            <h3 className="font-serif text-xl sm:text-2xl text-[#2B2233] font-medium leading-snug">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-[#6E6475] hover:text-[#2B2233] hover:bg-[#F4EFEB] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto grow space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
