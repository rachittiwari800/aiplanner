import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        ) : null}
        <div className="relative flex items-center">
          {icon ? (
            <div className="absolute left-3 text-gray-400 pointer-events-none">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-900',
                icon && 'pl-10',
                error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
                className
              )
            )}
            {...props}
          />
        </div>
        {error ? <p className="text-xs text-red-500 font-medium">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
