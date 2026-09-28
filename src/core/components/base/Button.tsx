import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A6B] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 rounded-lg gap-1.5',
    md: 'text-sm py-2.5 px-5 rounded-xl gap-2',
    lg: 'text-base py-3 px-6 rounded-xl gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#E07A6B] to-[#F2A76B] text-white shadow-sm hover:shadow-md hover:brightness-105 active:brightness-95 border-0',
    secondary:
      'bg-white text-[#2B2233] border border-[#E8DFD8] hover:bg-[#F7F3EE] hover:border-[#D8CCC3] active:bg-[#EFEAE4] shadow-xs',
    subtle:
      'bg-transparent text-[#6E6475] hover:text-[#2B2233] hover:bg-[#2B2233]/5 active:bg-[#2B2233]/10 border-0',
    outline:
      'bg-transparent text-[#2B2233] border border-[#E8DFD8] hover:border-[#2B2233] hover:bg-[#2B2233]/5',
    danger:
      'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
