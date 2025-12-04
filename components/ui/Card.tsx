
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, noPadding = false }) => {
  return (
    <div className={`bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden border-t-4 border-t-teal-500 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-zinc-100 bg-gray-50">
          <h3 className="text-lg font-bold text-zinc-800 tracking-tight">{title}</h3>
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};
