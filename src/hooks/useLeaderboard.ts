import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/lib/config';

export function useLeaderboard(period: string) {
  const [data, setData] = useState<any>({ entries: [], user_stats: {} });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const url =
        period === 'all_time'
          ? `${API_BASE_URL}/leaderboard/?period=all_time`
          : `${API_BASE_URL}/leaderboard/?period=${period}&page=1&limit=20`;
      const res = await fetch(url, { headers: { Authorization: `Token ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const json = await res.json();
      setData(json || { entries: [], user_stats: {} });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Could not load leaderboard for this period');
      setData({ entries: [], user_stats: {} });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
