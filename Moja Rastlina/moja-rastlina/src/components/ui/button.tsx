import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const base = variant === 'primary' ? 'btn-primary' : '';
  return <button className={`${base} ${className}`} {...props} />;
};

export default Button;


