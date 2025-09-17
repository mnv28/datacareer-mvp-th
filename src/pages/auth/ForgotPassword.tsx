import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AuthLayout from '@/components/auth/AuthLayout';
import { apiInstance } from '@/api/axiosApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await apiInstance.post('/api/auth/forgot-password', { email });
    setIsSubmitted(true);
    toast.success('Password reset instructions sent to your email');
  } catch (error) {
    toast.error('Failed to send reset instructions');
  } finally {
    setIsLoading(false);
  }
};
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you instructions to reset your password"
      footerText="Remember your password?"
      footerLink={{ text: 'Sign in', to: '/login' }}
    >
      {!isSubmitted ? (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="Enter your email"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-datacareer-blue hover:bg-datacareer-darkBlue"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send reset instructions'}
          </Button>
        </form>
      ) : (
        <div className="mt-8 text-center">
          <div className="rounded-full bg-green-100 p-3 mx-auto w-12 h-12 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Check your email
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            We've sent password reset instructions to {email}
          </p>
          <Button
            asChild
            variant="link"
            className="mt-4 text-datacareer-blue hover:text-datacareer-darkBlue"
          >
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword; 