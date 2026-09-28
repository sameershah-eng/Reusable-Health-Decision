import React from 'react';

export interface ChipProps {
  label: string;
  variant?: 'outline' | 'neutral' | 'accent' | 'warning';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'outline',
  size = 'md',
  icon,
  onClick,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs py-1 px-2.5 rounded-lg gap-1.5',
    md: 'text-sm py-1.5 px-3.5 rounded-xl gap-2',
  }[size];

  const variantStyles = {
    outline:
      'bg-[#FDFBF7] text-[#6E6475] border border-dashed border-[#D8CCC3] hover:border-[#6E6475] transition-colors',
    neutral:
      'bg-[#F4EFEB] text-[#2B2233] border border-[#E8DFD8]',
    accent:
      'bg-[#F8EFEA] text-[#9A4638] border border-[#E07A6B]/30',
    warning:
      'bg-amber-50/70 text-amber-900 border border-amber-200/80',
  }[variant];

  const interactiveStyles = onClick
    ? 'cursor-pointer hover:bg-white transition-all duration-150 active:scale-98'
    : '';

  return (
    <span
      className={`inline-flex items-center font-normal leading-tight ${sizeStyles} ${variantStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
