// UIComponents.js
import React from 'react';
// FormCard Component
export const FormCard = ({ title, subtitle, icon, children }) => {
  return (
    <div className="w-full max-w-md animate-fadeIn">
      <div className="relative bg-white rounded-xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-100">
        <div className="p-8">
          {icon && (
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-50 rounded-full">
                {icon}
              </div>
            </div>
          )}
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-center text-gray-600 mb-6">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

// Button Component
export const Button = ({
  children,
  className = '',
  fullWidth = false,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className
  ].join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

// InputField Component
export const InputField = ({
  label,
  error,
  icon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900
            placeholder-neutral-400 transition-colors duration-200
            focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500
            disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500
            ${icon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
