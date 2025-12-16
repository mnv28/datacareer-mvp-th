import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Rocket, ShieldCheck } from 'lucide-react';

interface TrialStartModalProps {
  open: boolean;
  // Keep optional for backward compatibility with ProtectedRoute usage
  onActivated?: (payload: { user?: any; trialStatus?: any; trialDaysRemaining?: any }) => void;
}

const TrialStartModal: React.FC<TrialStartModalProps> = ({ open, onActivated }) => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleActivate = () => {
    // Static modal: just redirect user to home on click
    setIsRedirecting(true);
    // If someone still passes onActivated, call it (no-op data)
    onActivated?.({});
    navigate('/', { replace: true });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent
        className="sm:max-w-[560px] [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-900">Welcome! Start your free trial</DialogTitle>
          <DialogDescription className="text-base pt-2 text-gray-600">
            Activate your <span className="font-semibold text-gray-900">7-day free trial</span> to unlock the full platform.
            You can upgrade to Pro anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Free Trial</p>
                <p className="mt-1 text-sm text-gray-600">7 days access • Cancel anytime</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <Rocket className="h-6 w-6 text-datacareer-blue" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Access all questions & jobdatabase</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Track progress & performance</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleActivate}
              disabled={isRedirecting}
              className="h-12 bg-datacareer-blue hover:bg-datacareer-darkBlue text-white font-semibold rounded-xl"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting…
                </>
              ) : (
                'Activate Trial'
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            7 days free trial • No card required
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialStartModal;

