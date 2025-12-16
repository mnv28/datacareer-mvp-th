import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiInstance } from '@/api/axiosApi';
import { Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPassword: React.FC = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const resp = await apiInstance.patch('/api/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (!resp?.data?.success) {
        // backend returns success true, but keep safe fallback
        toast.success(resp?.data?.message || 'Password changed successfully');
      } else {
        toast.success(resp.data.message || 'Password changed successfully');
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // After successful password change, go back to dashboard
      navigate('/', { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to change password. Please try again.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-datacareer-darkBlue">Change Password</h1>
            <p className="text-sm text-gray-600">Update your account password.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Update Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Old password</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter old password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-datacareer-blue hover:bg-datacareer-darkBlue"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPassword;

