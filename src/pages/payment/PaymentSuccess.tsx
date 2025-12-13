import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Wait a bit for webhook to process payment
    const timer = setTimeout(() => {
      // Optimistically update user data in localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.paymentDone = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Error updating user data:', error);
      }
      
      toast.success('Payment successful! Your subscription is now active.');
      // Reload page - user data is updated in localStorage
      window.location.href = '/';
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  return null; // No UI, just redirect
};

export default PaymentSuccess;
