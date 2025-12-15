import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { paymentService } from '@/redux/services/payment';

interface TrialExpiredModalProps {
  open: boolean;
  onPaymentSuccess: () => void;
}

const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ open, onPaymentSuccess }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setError(null);

    try {
      // Verify token exists
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        setError('Please login again to continue with payment.');
        setIsUpgrading(false);
        return;
      }

      // Create Stripe checkout session and redirect
      const response = await paymentService.createCheckoutSession();
      
      if (response.success && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      let errorMessage = 'Failed to start checkout. Please try again.';
      
      // Extract error message from backend response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific status codes
      if (error.response?.status === 403) {
        // 403 Forbidden - show backend message or default
        if (!error.response?.data?.message && !error.response?.data?.error) {
          errorMessage = 'Unable to process payment. Please try logging in again or contact support.';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent 
        className="sm:max-w-[500px] [&>button]:hidden"
        onInteractOutside={(e) => {
          // Prevent closing modal by clicking outside
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing modal with Escape key
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-datacareer-darkBlue">
            Trial Period Expired
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Your 7-day free trial has ended. Subscribe now to continue accessing all features.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="bg-gradient-to-r from-datacareer-blue to-datacareer-lightBlue p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Monthly Subscription</p>
                <p className="text-2xl font-bold">$4.90/month</p>
              </div>
              <Lock className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-orange-800 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                onClick={handleUpgrade}
                className="w-full bg-datacareer-blue hover:bg-datacareer-darkBlue text-white h-12 text-base font-semibold"
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Upgrade to Pro
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Your subscription will auto-renew monthly. You can cancel anytime from your account settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialExpiredModal;
