import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  bordered = true,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  }[padding];

  const shadowStyles = elevated
    ? 'shadow-[0_8px_30px_rgb(43,34,51,0.06)]'
    : 'shadow-[0_2px_12px_rgb(43,34,51,0.03)]';

  const borderStyles = bordered ? 'border border-[#EDE6DF]' : '';

  return (
    <div
      className={`bg-white rounded-[20px] ${shadowStyles} ${borderStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
