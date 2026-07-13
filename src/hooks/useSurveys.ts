import { useState, useEffect } from 'react';
import { getCachedData, setCachedData, isCacheValid } from '@/lib/cache';

import { API_BASE_URL } from '@/lib/config';

interface Survey {
  id: string;
  title: string;
  description: string;
  payout: number;
  payout_usd: number;
  length_minutes: number;
  conversion_rate: number;
  score: number;
  type: string;
  category: string;
  external_url: string;
  provider: string;
  requires_qualification: boolean;
  rating_count: number;
  rating_avg: number;
  is_top_survey: boolean;
}

export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const cacheKey = 'featured_surveys';
      if (isCacheValid(cacheKey)) {
        const cached = getCachedData<Survey[]>(cacheKey);
        if (cached) {
          setSurveys(cached);
          setLoading(false);
          return;
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/surveys/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch surveys');
        const data = await res.json();
        const featured = data.surveys?.slice(0, 12) || [];
        setCachedData(cacheKey, featured);
        setSurveys(featured);
      } catch (error) {
        console.error('Error fetching surveys:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  return { surveys, loading };
}
