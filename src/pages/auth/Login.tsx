import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AuthLayout from '@/components/auth/AuthLayout';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';
import { getDeviceId } from '@/lib/fingerprint';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoadingDeviceId, setIsLoadingDeviceId] = useState(true);
  const dispatch = useAppDispatch();
  const { isLoading, error, token } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  // Get device ID on component mount
  useEffect(() => {
    const fetchDeviceId = async () => {
      try {
        const id = await getDeviceId();
        setDeviceId(id);
      } catch (error) {
        // Silently fail if device ID cannot be obtained
      } finally {
        setIsLoadingDeviceId(false);
      }
    };

    fetchDeviceId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Wait for device ID if still loading
    if (isLoadingDeviceId) {
      toast.error('Please wait, initializing device...');
      return;
    }

    try {
      const result = await dispatch(login({ email, password, deviceId: deviceId || undefined })).unwrap();

      // Always navigate to home after successful login
      // ProtectedRoute will handle access control based on trial status
      toast.success('Logged in successfully!');

      // Use replace to prevent back navigation to login page
      navigate('/', { replace: true });
    } catch (error: any) {
      // Handle specific trial errors from backend
      const errorMessage = error?.message || error as string;

      if (errorMessage === 'no-trial' || errorMessage.includes('No trial available')) {
        toast.error('No trial available for this device. Please purchase a subscription to continue.');
        // Still navigate to home, ProtectedRoute will show modal
        navigate('/');
      } else if (errorMessage === 'trial-expired' || errorMessage.includes('Trial expired')) {
        toast.error('Your trial has expired. Please purchase a subscription to continue.');
        // Still navigate to home, ProtectedRoute will show modal
        navigate('/');
      } else if (errorMessage.includes('Device ID is required')) {
        toast.error('Device ID is required. Please refresh the page and try again.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLink={{ text: 'Create an account', to: '/register' }}
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
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
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label
              htmlFor="remember-me"
              className="text-sm text-gray-600"
            >
              Remember me
            </Label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-datacareer-blue hover:text-datacareer-darkBlue"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-datacareer-blue hover:bg-datacareer-darkBlue"
          disabled={isLoading || isLoadingDeviceId}
        >
          {isLoading || isLoadingDeviceId ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login; 