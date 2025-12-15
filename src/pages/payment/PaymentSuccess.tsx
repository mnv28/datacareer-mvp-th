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
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      const isPaid = (u: any, status?: any) => {
        const sub = (u?.subscriptionStatus || '').toString().toLowerCase();
        return u?.paymentDone === true || sub === 'active' || sub === 'trialing' || sub === 'trial' || status === 'paid';
      };

      // Webhook delay ho sakta hai, isliye thoda retry/poll karte hai
      const maxAttempts = 8; // ~12s total (with 1500ms delay)
      let lastResp: any = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const resp = await apiInstance.get('/api/auth/check-trial-status');
          lastResp = resp?.data;

          const updatedUser = resp.data?.user;
          const updatedTrialStatus = resp.data?.trialStatus;
          const updatedDays = resp.data?.trialDaysRemaining;

          if (isPaid(updatedUser, updatedTrialStatus)) {
            // Paid confirmed -> update Redux + localStorage
            if (updatedUser) {
              try {
                localStorage.setItem('user', JSON.stringify(updatedUser));
              } catch {
                // ignore
              }
            }

            dispatch(updateTrialStatus({
              trialStatus: updatedTrialStatus || 'paid',
              trialDaysRemaining: updatedDays ?? null,
              user: updatedUser || undefined,
            }));

            toast.success('Payment successful! Your subscription is now active.');
            window.location.href = '/';
            return;
          }
        } catch {
          // ignore and retry
        }

        // wait before next attempt (except after last)
        if (attempt < maxAttempts - 1) {
          await sleep(1500);
        }
      }

      // Webhook delay / stale backend response: we're on success page, so optimistically unlock UI.
      // This prevents modal + "Upgrade to Pro" from showing after Stripe return.
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.paymentDone = true;
          user.subscriptionStatus = 'active';
          user.planType = 'premium';
          localStorage.setItem('user', JSON.stringify(user));
          dispatch(updateTrialStatus({ trialStatus: 'paid', trialDaysRemaining: null, user }));
        } else {
          // If no user in storage, still mark plan as paid in Redux so UI unlocks this session
          dispatch(updateTrialStatus({ trialStatus: 'paid', trialDaysRemaining: null }));
        }
      } catch {
        // ignore
        dispatch(updateTrialStatus({ trialStatus: 'paid', trialDaysRemaining: null }));
      }

      const msg = lastResp?.message || 'Payment received. Activating your subscription...';
      toast.success(msg);
      window.location.href = '/';
    };

    handlePaymentSuccess();
  }, [sessionId, dispatch]);

  return null; // No UI, just redirect
};

export default PaymentSuccess;
