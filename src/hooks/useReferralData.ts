import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { API_BASE_URL, SITE_URL } from '@/lib/config';

interface ReferralStats {
  referred_users: number;
  referral_earnings: string;
  leaderboard: Array<{
    username: string;
    referrals: number;
    is_active: boolean;
  }>;
}

interface CommissionRate {
  commission_percentage: number;
  is_partner: boolean;
  formatted: string;
}

export function useReferralData() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [commissionRate, setCommissionRate] = useState<CommissionRate>({
    commission_percentage: 10.0,
    is_partner: false,
    formatted: '10.00%',
  });
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    referred_users: 0,
    referral_earnings: '0.00',
    leaderboard: [],
  });
  const [userStats, setUserStats] = useState({
    first_name: '',
    last_name: '',
    level: 'Bronze',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Commission rate
        const rateRes = await fetch(`${API_BASE_URL}/referral/commission-rate/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          setCommissionRate({
            commission_percentage: rateData.commission_percentage,
            is_partner: rateData.is_partner,
            formatted: rateData.formatted,
          });
        }

        // User profile
        const profileRes = await fetch(`${API_BASE_URL}/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserStats({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            level: profileData.level || 'Bronze',
          });
          setReferralCode(profileData.referral_code || '');
          setReferralLink(
            profileData.referral_url ||
              `${SITE_URL}/register?ref=${profileData.referral_code || ''}`
          );
        }

        // Referral stats
        const statsRes = await fetch(`${API_BASE_URL}/referral/stats/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setReferralStats({
            referred_users: statsData.total_referrals || 0,
            referral_earnings: (Number(statsData.referral_earnings) || 0).toFixed(2),
            leaderboard:
              statsData.referral_list?.map((user: any) => ({
                username: user.username,
                referrals: user.is_active ? 1 : 0,
                is_active: user.is_active,
              })) || [],
          });

          // Fallback if referral code not set from profile
          if (!referralCode && statsData.referral_code) {
            setReferralCode(statsData.referral_code);
            setReferralLink(
              statsData.referral_url ||
                `${SITE_URL}/register?ref=${statsData.referral_code}`
            );
          }
        }
      } catch (err) {
        console.error('Error fetching referral data:', err);
        toast.error('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Earncentive and Earn Money!',
          text: `Use my referral code ${referralCode} to sign up and earn rewards together!`,
          url: referralLink,
        });
        toast.success('Referral link shared successfully!');
      } catch (err) {
        console.error('Error sharing:', err);
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const shareOnTwitter = () => {
    const text = `Join Earncentive using my referral code ${referralCode} and start earning money together! 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      referralLink
    )}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = `Join Earncentive using my referral code ${referralCode} and start earning money together! 🚀 ${referralLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Join Earncentive and Earn With Me!';
    const body = `Hi! I've been using Earncentive to earn money online and thought you might be interested too.

Use my referral link to sign up and we'll both earn extra rewards:
${referralLink}

My referral code: ${referralCode}

Looking forward to earning together! 🎉`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  return {
    loading,
    referralCode,
    referralLink,
    commissionRate,
    referralStats,
    userStats,
    copyReferralLink,
    copyReferralCode,
    shareReferralLink,
    shareOnTwitter,
    shareOnWhatsApp,
    shareViaEmail,
  };
}
