import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info('Payment was cancelled. No charges were made.');
    navigate('/', { replace: true });
  }, [navigate]);

  return null; // No UI, just redirect
};

export default PaymentCancel;
