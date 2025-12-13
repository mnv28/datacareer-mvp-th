import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

interface SubscriptionStatusProps {
  className?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ className = '' }) => {
  const { user, trialStatus } = useAppSelector((state) => state.auth);

  // Determine status from Redux state only
  if (user?.paymentDone || trialStatus === 'paid') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Pro Active
        </Badge>
      </div>
    );
  }

  if (trialStatus === 'trial-active') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className="h-4 w-4 text-blue-500" />
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Trial Active
        </Badge>
      </div>
    );
  }

  // Default: Free plan or no trial
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        Free Plan
      </Badge>
    </div>
  );
};

export default SubscriptionStatus;
