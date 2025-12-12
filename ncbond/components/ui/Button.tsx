
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'google';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center";
  
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md shadow-teal-500/20",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-900 focus:ring-zinc-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400 bg-white",
    google: "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-300 shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
