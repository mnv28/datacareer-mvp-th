import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { paymentService } from '@/redux/services/payment';
import { useAppSelector } from '@/redux/hooks';
import { Crown, CreditCard, Loader2, ShieldCheck, XCircle, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { updateTrialStatus } from '@/redux/slices/authSlice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TRIAL_DAYS = 7;

const SubscriptionSettings: React.FC = () => {
  const { user, trialStatus, trialDaysRemaining } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [billingStart, setBillingStart] = useState<string | null>(null);
  const [billingEnd, setBillingEnd] = useState<string | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState<boolean | null>(null);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const subscriptionStatus = (user?.subscriptionStatus || '').toString().toLowerCase();
  const isPro =
    user?.paymentDone === true ||
    trialStatus === 'paid' ||
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trialing' ||
    subscriptionStatus === 'trial';

  // Check if trial limit reached (trial expired or used on device)
  const isTrialLimitReached = 
    trialStatus === 'trial-expired' || 
    (user as any)?.trialUsed === true ||
    (trialDaysRemaining === 0 && trialStatus !== 'trial-active');

  const trialInfo = useMemo(() => {
    // Prefer backend remaining days from login/check-trial-status
    if (typeof trialDaysRemaining === 'number') {
      const remaining = Math.max(0, Math.min(TRIAL_DAYS, trialDaysRemaining));
      const used = Math.max(0, Math.min(TRIAL_DAYS, TRIAL_DAYS - remaining));
      return { used, remaining, total: TRIAL_DAYS };
    }

    // Fallback from trialStart
    const trialStartRaw = (user as any)?.trialStart;
    if (trialStartRaw) {
      const start = new Date(trialStartRaw);
      if (!Number.isNaN(start.getTime())) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.floor((Date.now() - start.getTime()) / msPerDay);
        const used = Math.max(0, Math.min(TRIAL_DAYS, days + 1));
        const remaining = Math.max(0, TRIAL_DAYS - used);
        return { used, remaining, total: TRIAL_DAYS };
      }
    }

    if ((user as any)?.trialUsed === true) {
      return { used: TRIAL_DAYS, remaining: 0, total: TRIAL_DAYS };
    }

    return null;
  }, [trialDaysRemaining, user]);

  useEffect(() => {
    if (!isPro) return;

    let isMounted = true;
    setIsLoadingBilling(true);

    (async () => {
      try {
        const resp = await paymentService.getSubscriptionStatus();
        if (!isMounted) return;
        const sub = resp?.subscription;
        setBillingStart(sub?.startDate ?? null);
        // Use renewsOn as the "end/next billing" date (per backend)
        setBillingEnd((sub as any)?.renewsOn ?? (sub as any)?.endDate ?? (sub as any)?.endsOn ?? null);
        // Check if subscription is scheduled to cancel
        setCancelAtPeriodEnd((sub as any)?.cancelAtPeriodEnd ?? false);
        setAccessUntil((sub as any)?.accessUntil ?? null);
      } catch {
        if (!isMounted) return;
        setBillingStart(null);
        setBillingEnd(null);
        setCancelAtPeriodEnd(null);
        setAccessUntil(null);
      } finally {
        if (isMounted) setIsLoadingBilling(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isPro]);

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
  };

  const handleSubscribe = async () => {
    setIsSubmitting(true);
    try {
      const resp = await paymentService.createCheckoutSession();
      if (resp.success && resp.url) {
        window.location.href = resp.url;
        return;
      }
      throw new Error('Failed to start checkout');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to start checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelSubscription = async () => {
    setShowCancelDialog(false);
    setIsCancelling(true);
    try {
      const resp = await paymentService.cancelSubscription();
      
      // Update local state
      setCancelAtPeriodEnd(resp.cancelAtPeriodEnd);
      setAccessUntil(resp.accessUntil);
      
      // Update Redux user state
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const updatedUser = JSON.parse(userStr);
          updatedUser.cancelAtPeriodEnd = resp.cancelAtPeriodEnd;
          updatedUser.subscriptionEndDate = resp.accessUntil;
          updatedUser.subscriptionStatus = resp.subscriptionStatus;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          dispatch(updateTrialStatus({ user: updatedUser }));
        }
      } catch (e) {
        // Ignore localStorage update errors
      }
      
      toast.success(resp.message || 'Auto-pay cancelled successfully. Your subscription will remain active until the end of the current period.');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-datacareer-darkBlue">Manage Subscription</h1>
            <p className="text-sm text-gray-600">View your plan, trial, and billing options.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>Current Plan</span>
                {isPro ? (
                  <span className="inline-flex items-center gap-2 text-sm text-green-700">
                    <ShieldCheck className="h-4 w-4" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <Crown className="h-4 w-4" />
                    Upgrade
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {isPro 
                        ? 'Pro Monthly' 
                        : isTrialLimitReached 
                          ? 'Trial Expired' 
                          : (trialStatus === 'trial-active' ? 'Free Trial' : 'Free')
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-xl font-semibold text-gray-900">{isPro ? '$4.90' : '$0.00'}<span className="text-sm font-medium text-gray-600">{isPro ? ' / month' : ''}</span></p>
                  </div>
                </div>

                {/* {isPro && (
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs font-medium text-gray-600">Start date</p>
                      <p className="font-semibold text-gray-900">{isLoadingBilling ? 'Loading…' : formatDate(billingStart)}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs font-medium text-gray-600">Renews on</p>
                      <p className="font-semibold text-gray-900">{isLoadingBilling ? 'Loading…' : formatDate(billingEnd)}</p>
                    </div>
                  </div>
                )} */}

                {/* Only show trial progress if trial is active and not expired/limit reached */}
                {trialInfo && !isPro && !isTrialLimitReached && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Trial progress</span>
                      <span>
                        <span className="font-semibold">{trialInfo.used}/{trialInfo.total}</span> used • <span className="font-semibold">{trialInfo.remaining}</span> left
                      </span>
                    </div>
                    <Progress className="mt-2" value={(trialInfo.used / trialInfo.total) * 100} />
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  <div className="capitalize"><span className="font-medium text-gray-800 capitalize">Status:</span> {(user?.subscriptionStatus || trialStatus || 'unknown').toString()}</div>
                  <div className="capitalize"><span className="font-medium text-gray-800 capitalize">Plan type:</span> {(user?.planType || (isPro ? 'premium' : 'trial')).toString()}</div>
                  {cancelAtPeriodEnd && accessUntil && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-orange-800">
                        <p className="font-medium">Auto-pay cancelled</p>
                        <p>Your subscription will end on {formatDate(accessUntil)}</p>
                      </div>
                    </div>
                  )}
                </div>
                {!isPro ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSubscribe} disabled={isSubmitting} className="bg-datacareer-blue hover:bg-datacareer-darkBlue">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirecting…
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Subscribe ($4.90/mo)
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  !cancelAtPeriodEnd && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCancelClick} 
                        disabled={isCancelling} 
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling…
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Auto-pay
                          </>
                        )}
                      </Button>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Auto-pay?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel auto-pay? Your subscription will remain active until the end of the current billing period, but will not renew automatically. You can resubscribe anytime before the period ends.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Cancel Auto-pay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default SubscriptionSettings;
