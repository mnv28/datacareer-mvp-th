import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      // Wait for webhook to process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user data in localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Mark payment as done
          user.paymentDone = true;
          user.subscriptionStatus = 'active';
          localStorage.setItem('user', JSON.stringify(user));
          
          // Also update token timestamp to ensure fresh state
          const token = localStorage.getItem('token');
          if (token) {
            localStorage.setItem('token', token); // Re-save to update timestamp
          }
        }
      } catch (error) {
        // Silently handle error
      }
      
      toast.success('Payment successful! Your subscription is now active.');
      
      // Force page reload to initialize fresh Redux state from updated localStorage
      window.location.reload();
    };

    handlePaymentSuccess();
  }, [sessionId]);

  return null; // No UI, just redirect
};

export default PaymentSuccess;
