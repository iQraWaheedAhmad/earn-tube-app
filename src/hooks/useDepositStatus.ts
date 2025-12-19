import { useState, useEffect } from 'react';
import { verifyToken } from '@/lib/auth';

interface Deposit {
  id: string;
  coin: string;
  amount: number;
  transactionHash: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  paymentProof?: string;
}

interface DepositStatus {
  hasDeposit: boolean;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | null;
  hasRejectedDeposit: boolean;
}

export const useDepositStatus = () => {
  const [depositStatus, setDepositStatus] = useState<DepositStatus>({
    hasDeposit: false,
    status: null,
    hasRejectedDeposit: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepositStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/deposit/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const deposits: Deposit[] = result.data.deposits;
            const hasDeposit = deposits.length > 0;
            const latestDeposit = deposits[0]; // Most recent deposit
            const hasRejectedDeposit = deposits.some((d: Deposit) => d.status === 'REJECTED');

            setDepositStatus({
              hasDeposit,
              status: latestDeposit?.status || null,
              hasRejectedDeposit,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch deposit status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepositStatus();
  }, []);

  return { depositStatus, loading };
};
