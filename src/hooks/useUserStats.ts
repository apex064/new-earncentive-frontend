import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/lib/config';

export function useUserStats() {
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/leaderboard/my-stats/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user stats');
        const data = await res.json();
        setUserStats(data?.all_time || null);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error('Could not load your stats');
        setUserStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  return { userStats, loading };
}
