import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/hooks';
import TrialExpiredModal from '@/components/payment/TrialExpiredModal';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, trialStatus, user } = useAppSelector((state) => state.auth);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [isCheckingTrial, setIsCheckingTrial] = useState(true);
  const [currentTrialStatus, setCurrentTrialStatus] = useState<'paid' | 'trial-active' | 'trial-expired' | 'no-trial' | undefined>(trialStatus);

  // Use trial status from login response (no API call needed)
  useEffect(() => {
    if (!token) {
      setIsCheckingTrial(false);
      return;
    }

    // Use trial status from Redux (set during login)
    // If trialStatus is not set but user exists, derive it from user data
    let derivedTrialStatus = trialStatus;
    if (!derivedTrialStatus && user) {
      if (user.paymentDone) {
        derivedTrialStatus = 'paid';
      } else if (!user.trialStart) {
        derivedTrialStatus = 'no-trial';
      } else {
        const now = new Date();
        const trialStart = new Date(user.trialStart);
        const daysDifference = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
        derivedTrialStatus = daysDifference < 7 ? 'trial-active' : 'trial-expired';
      }
    }

    setCurrentTrialStatus(derivedTrialStatus);

    if (derivedTrialStatus && user) {
      // Show modal if trial expired and payment not done
      if ((derivedTrialStatus === 'trial-expired' || derivedTrialStatus === 'no-trial') && !user.paymentDone) {
        setShowTrialModal(true);
      } else {
        setShowTrialModal(false);
      }
    }
    
    setIsCheckingTrial(false);
  }, [token, user, trialStatus]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking trial status
  if (isCheckingTrial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-datacareer-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Block access if trial expired and payment not done
  if ((currentTrialStatus === 'trial-expired' || currentTrialStatus === 'no-trial') && !user?.paymentDone) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-datacareer-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentTrialStatus === 'trial-expired' ? 'Trial Period Expired' : 'Subscription Required'}
            </h2>
            <p className="text-gray-600 mb-6">Please complete your subscription to continue accessing the platform.</p>
          </div>
        </div>
        <TrialExpiredModal
          open={true}
          onPaymentSuccess={() => {
            // After payment, optimistically update user data
            try {
              const userStr = localStorage.getItem('user');
              if (userStr) {
                const user = JSON.parse(userStr);
                user.paymentDone = true;
                localStorage.setItem('user', JSON.stringify(user));
              }
            } catch (error) {
              // Silently fail if localStorage update fails
            }
            
            toast.success('Payment successful! Your subscription is now active.');
            // Reload page to refresh state
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 