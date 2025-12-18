import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { paymentService } from '@/redux/services/payment';
import { useAppSelector } from '@/redux/hooks';
import { Crown, CreditCard, Loader2, ShieldCheck } from 'lucide-react';

const TRIAL_DAYS = 7;

const SubscriptionSettings: React.FC = () => {
  const { user, trialStatus, trialDaysRemaining } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingStart, setBillingStart] = useState<string | null>(null);
  const [billingEnd, setBillingEnd] = useState<string | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);

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
      } catch {
        if (!isMounted) return;
        setBillingStart(null);
        setBillingEnd(null);
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
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionSettings;
