import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { apiInstance } from '@/api/axiosApi';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateTrialStatus } from '@/redux/slices/authSlice';
import { Loader2, User } from 'lucide-react';

const SettingsProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const userFromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const effectiveUser = userFromStorage || user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName((effectiveUser?.name || '').toString());
    setEmail((effectiveUser?.email || '').toString());
  }, [effectiveUser?.name, effectiveUser?.email]);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUser) {
      toast.error('User not found. Please login again.');
      return;
    }

    const currentName = (effectiveUser?.name || '').toString();
    const currentEmail = (effectiveUser?.email || '').toString();

    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();

    const payload: { name?: string; email?: string } = {};

    if (nextName && nextName !== currentName) {
      if (nextName.length < 2) {
        toast.error('Name must be at least 2 characters.');
        return;
      }
      payload.name = nextName;
    }

    if (nextEmail && nextEmail !== currentEmail.toLowerCase()) {
      if (!validateEmail(nextEmail)) {
        toast.error('Invalid email format.');
        return;
      }
      payload.email = nextEmail;
    }

    if (!payload.name && !payload.email) {
      toast.message('No changes to save.');
      return;
    }

    setIsSaving(true);
    try {
      const resp = await apiInstance.patch('/api/auth/profile', payload);
      const updatedUser = resp?.data?.user;

      if (!updatedUser) {
        throw new Error('Profile updated, but user data was not returned.');
      }

      // Merge to preserve any fields that backend might omit
      const merged = { ...(effectiveUser as any), ...(updatedUser as any) };
      dispatch(updateTrialStatus({ user: merged }));
      toast.success('Profile updated successfully');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile. Please try again.';
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
            <h1 className="text-2xl font-bold text-datacareer-darkBlue">Profile</h1>
            <p className="text-sm text-gray-600">Update your name and email.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Update Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="cursor-not-allowed bg-gray-100 text-gray-600"
                    placeholder="you@example.com"
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
                        Saving…
                      </>
                    ) : (
                      'Save Changes'
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

export default SettingsProfile;

