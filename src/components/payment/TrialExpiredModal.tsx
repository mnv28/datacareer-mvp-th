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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgradeClick = async () => {
    setIsProcessing(true);

    try {
      // Create Stripe checkout session
      const response = await paymentService.createCheckoutSession();
      
      if (response.success && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.message || 'Failed to start checkout. Please try again.';
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent 
        className="sm:max-w-[500px]"
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
                <p className="text-2xl font-bold">$29.99/month</p>
              </div>
              <Lock className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-1">Secure Payment</p>
                  <p className="text-xs text-blue-700">
                    You'll be redirected to Stripe's secure checkout page to complete your payment.
                    Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleUpgradeClick}
                className="w-full bg-datacareer-blue hover:bg-datacareer-darkBlue text-white h-12 text-base font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Upgrade to Pro (Monthly)
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
