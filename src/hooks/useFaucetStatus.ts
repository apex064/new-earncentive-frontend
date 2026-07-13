import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useReCaptcha } from '@/hooks/useReCaptcha';

import { API_BASE_URL } from '@/lib/config';

export interface FaucetStatus {
  earnings_last_7_days?: number;
  min_earnings_required?: number;
  is_active: boolean;
  min_amount: number;
  max_amount: number;
  cooldown_minutes: number;
  daily_claim_limit: number;
  can_claim: boolean;
  message: string;
  seconds_remaining: number;
  claims_today: number;
  total_claimed: number;
  last_claim: {
    amount: number;
    claimed_at: string;
  } | null;
}

export function useFaucetStatus() {
  const [status, setStatus] = useState<FaucetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastClaimAmount, setLastClaimAmount] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { executeRecaptcha } = useReCaptcha();

  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/faucet/status/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.seconds_remaining > 0) setCountdown(data.seconds_remaining);
      }
    } catch (err) {
      console.error('Error fetching faucet status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const claim = async () => {
    const token = localStorage.getItem('token');
    if (!token || claiming) return;

    setClaiming(true);
    try {
      const recaptchaToken = await executeRecaptcha('faucet_claim');
      if (!recaptchaToken) {
        toast.error('Security verification failed. Please try again.');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/faucet/claim/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recaptcha_token: recaptchaToken }),
      });
      const data = await res.json();

      if (res.ok) {
        setLastClaimAmount(data.amount);
        setShowCelebration(true);
        toast.success(data.message);
        setCountdown(data.next_claim_seconds);
        setTimeout(() => {
          setShowCelebration(false);
          setLastClaimAmount(null);
        }, 3000);
        fetchStatus(); // refresh status
      } else {
        toast.error(data.error || 'Failed to claim');
        if (data.seconds_remaining) setCountdown(data.seconds_remaining);
      }
    } catch (err) {
      console.error('Error claiming from faucet:', err);
      toast.error('Failed to claim from faucet');
    } finally {
      setClaiming(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            fetchStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [countdown, fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    claiming,
    countdown,
    lastClaimAmount,
    showCelebration,
    claim,
  };
}
