import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-12 px-6 max-w-md mx-auto flex flex-col items-center justify-center ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#F4EFEB] text-[#6E6475] flex items-center justify-center mb-4 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-xl sm:text-2xl text-[#2B2233] font-medium mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-[#6E6475] leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
