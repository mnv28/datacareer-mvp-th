import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateTrialStatus } from '@/redux/slices/authSlice';
import TrialExpiredModal from '@/components/payment/TrialExpiredModal';
import TrialStartModal from '@/components/payment/TrialStartModal';
import { toast } from 'sonner';
import { apiInstance } from '@/api/axiosApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, trialStatus, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isCheckingTrial, setIsCheckingTrial] = useState(true);
  const [currentTrialStatus, setCurrentTrialStatus] = useState<'paid' | 'trial-active' | 'trial-expired' | 'no-trial' | undefined>(trialStatus);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  const readUserFromStorage = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Prefer freshest user data (localStorage may be newer than Redux after payment success)
  const userFromStorage = readUserFromStorage();
  const effectiveUser = userFromStorage || user;

  // Use trial status from login response (no API call needed)
  useEffect(() => {
    if (!token) {
      setIsCheckingTrial(false);
      return;
    }

    const latestUserFromStorage = readUserFromStorage();
    const latestEffectiveUser = latestUserFromStorage || user;

    // If localStorage has paymentDone=true but Redux doesn't, sync Redux now
    if (latestUserFromStorage?.paymentDone === true && user?.paymentDone !== true) {
      dispatch(updateTrialStatus({ trialStatus: 'paid', trialDaysRemaining: null, user: latestUserFromStorage }));
    }

    const subscriptionStatus = (latestEffectiveUser?.subscriptionStatus || '').toString().toLowerCase();
    const hasActiveSubscription =
      latestEffectiveUser?.paymentDone === true ||
      subscriptionStatus === 'active' ||
      subscriptionStatus === 'trialing' ||
      subscriptionStatus === 'trial';

    // If user has active subscription, allow access immediately
    if (hasActiveSubscription) {
      setCurrentTrialStatus('paid');
      setIsCheckingTrial(false);
      return;
    }

    // Derive trial status from user data
    let derivedTrialStatus = trialStatus;
    if (!derivedTrialStatus && latestEffectiveUser) {
      if (!latestEffectiveUser.trialStart) {
        derivedTrialStatus = 'no-trial';
      } else {
        const now = new Date();
        const trialStart = new Date(latestEffectiveUser.trialStart);
        const daysDifference = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
        derivedTrialStatus = daysDifference < 7 ? 'trial-active' : 'trial-expired';
      }
    }

    setCurrentTrialStatus(derivedTrialStatus);

    // If it looks expired, do ONE backend refresh to avoid stale localStorage/login mismatch
    if (derivedTrialStatus === 'trial-expired' && !hasActiveSubscription && !refreshAttempted) {
      (async () => {
        try {
          setIsCheckingTrial(true);
          setRefreshAttempted(true);

          // Backend should return latest user + status
          const resp = await apiInstance.get('/api/auth/check-trial-status');
          const updatedUser = resp.data?.user;
          const updatedTrialStatus = resp.data?.trialStatus;
          const updatedDays = resp.data?.trialDaysRemaining;

          if (updatedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }

          dispatch(updateTrialStatus({
            trialStatus: updatedTrialStatus,
            trialDaysRemaining: updatedDays,
            user: updatedUser,
          }));

          // If backend says paid/active now, unlock immediately
          const updatedSub = (updatedUser?.subscriptionStatus || '').toString().toLowerCase();
          const isNowPaid =
            updatedUser?.paymentDone === true ||
            updatedSub === 'active' ||
            updatedSub === 'trialing' ||
            updatedSub === 'trial' ||
            updatedTrialStatus === 'paid';

          setCurrentTrialStatus(isNowPaid ? 'paid' : (updatedTrialStatus || 'trial-expired'));
        } catch {
          // If endpoint doesn't exist / fails, fall back to local derived status
          setRefreshAttempted(true);
          setCurrentTrialStatus('trial-expired');
        } finally {
          setIsCheckingTrial(false);
        }
      })();
      return;
    }

    setIsCheckingTrial(false);
  }, [token, trialStatus, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const subscriptionStatus = (effectiveUser?.subscriptionStatus || '').toString().toLowerCase();
  const hasActiveSubscription =
    effectiveUser?.paymentDone === true ||
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trialing' ||
    subscriptionStatus === 'trial';


  if (!isCheckingTrial && currentTrialStatus === 'no-trial' && !hasActiveSubscription) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Start your free trial</h2>
            <p className="text-gray-600">
              To continue, please activate your 7-day free trial. You can upgrade to Pro anytime.
            </p>
          </div>
        </div>
        <TrialStartModal
          open={true}
          onActivated={({ user: updatedUser, trialStatus: updatedTrialStatus, trialDaysRemaining: updatedDays }) => {
            try {
              if (updatedUser) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
              } else {
                    // If backend doesn't return user, at least mark trialStart locally to avoid looping UI.
                const raw = localStorage.getItem('user');
                if (raw) {
                  const u = JSON.parse(raw);
                  if (!u.trialStart) u.trialStart = new Date().toISOString();
                  localStorage.setItem('user', JSON.stringify(u));
                  updatedUser = u;
                }
              }
            } catch {
              // ignore
            }

            dispatch(
              updateTrialStatus({
                trialStatus: (updatedTrialStatus || 'trial-active') as any,
                trialDaysRemaining: updatedDays ?? null,
                user: updatedUser,
              })
            );

            setCurrentTrialStatus((updatedTrialStatus || 'trial-active') as any);
            setIsCheckingTrial(false);
            toast.success('Trial activated. Enjoy!');
          }}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 