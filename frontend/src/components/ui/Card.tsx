import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverEffect = true, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 shadow-xs transition-all duration-300',
          hoverEffect && 'hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/50',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
