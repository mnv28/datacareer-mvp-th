import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AuthLayout from '@/components/auth/AuthLayout';
import { apiInstance } from '@/api/axiosApi';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // ...existing code...
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');

    // Get token/email from query params (if available)
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setToken(params.get('token') || '');
        setEmail(params.get('email') || '');
    }, []);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
    }

    try {
        await apiInstance.post('/api/auth/reset-password', {
            email,
            token,
            newPassword,
        });
        toast.success('Password has been reset successfully');
        navigate('/login');
    } catch (error) {
        toast.error('Failed to reset password');
    } finally {
        setIsLoading(false);
    }
};

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your new password below"
            footerText="Remember your password?"
            footerLink={{ text: 'Sign in', to: '/login' }}
        >
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                        New Password
                    </Label>
                    <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1"
                        placeholder="Enter your new password"
                    />
                </div>
                <div>
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                        Confirm Password
                    </Label>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1"
                        placeholder="Confirm your new password"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-datacareer-blue hover:bg-datacareer-darkBlue"
                    disabled={isLoading}
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;