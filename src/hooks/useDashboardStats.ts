import { useState, useEffect } from 'react';
import { getCachedData, setCachedData, isCacheValid } from '@/lib/cache';

import { API_BASE_URL } from '@/lib/config';

interface DashboardData {
  balance: number;
  total_earned: number;
  today_earnings: number;
  today_tasks: number;
  total_tasks: number;
  streak_days: number;
  level: string;
  recent_activity: Array<{ reward: string; [key: string]: any }>;
}

export function useDashboardStats() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    total_earned: 0,
    today_earnings: 0,
    today_tasks: 0,
    total_tasks: 0,
    streak_days: 0,
    level: 'Silver',
    recent_activity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const cacheKey = 'dashboard_stats';
      if (isCacheValid(cacheKey)) {
        const cached = getCachedData<DashboardData>(cacheKey);
        if (cached) {
          setDashboardData(cached);
          setLoading(false);
          return;
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/stats/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await res.json();
        setCachedData(cacheKey, data);
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { dashboardData, loading };
}
