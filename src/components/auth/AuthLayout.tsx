import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLink?: {
    text: string;
    to: string;
  };
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex justify-center py-8">
        <Link to="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-auto" />
          <span className="text-2xl font-bold text-datacareer-blue">DataCareer</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-center text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {footerText && footerLink && (
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">{footerText}</span>{' '}
              <Link
                to={footerLink.to}
                className="font-medium text-datacareer-blue hover:text-datacareer-darkBlue"
              >
                {footerLink.text}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DataCareer. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout; 