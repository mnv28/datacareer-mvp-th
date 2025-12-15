import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppDispatch } from '@/redux/hooks';
import { updateTrialStatus } from '@/redux/slices/authSlice';
import { apiInstance } from '@/api/axiosApi';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Try to fetch updated user from backend first (so it won't be overwritten on next login)
      try {
        const resp = await apiInstance.get('/api/auth/check-trial-status');
        const updatedUser = resp.data?.user;
        const updatedTrialStatus = resp.data?.trialStatus;
        const updatedDays = resp.data?.trialDaysRemaining;

        dispatch(updateTrialStatus({
          trialStatus: updatedTrialStatus || 'paid',
          trialDaysRemaining: updatedDays ?? null,
          user: updatedUser || undefined,
        }));

        if (updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        // Fallback: optimistic local update
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.paymentDone = true;
            user.subscriptionStatus = 'active';
            localStorage.setItem('user', JSON.stringify(user));
            dispatch(updateTrialStatus({ trialStatus: 'paid', trialDaysRemaining: null, user }));
          }
        } catch {
          // ignore
        }
      }

      toast.success('Payment successful! Your subscription is now active.');
      
      // Force page reload to reinitialize Redux state from localStorage
      window.location.href = '/';
    };

    handlePaymentSuccess();
  }, [sessionId, dispatch]);

  return null; // No UI, just redirect
};

export default PaymentSuccess;
