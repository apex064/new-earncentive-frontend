import { useState, useEffect } from 'react';
import { getCachedData, setCachedData, isCacheValid } from '@/lib/cache';

import { API_BASE_URL } from '@/lib/config';

export function useProfile() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const cacheKey = 'profile_data';
      if (isCacheValid(cacheKey)) {
        const cached = getCachedData(cacheKey);
        if (cached) {
          setFirstName(cached.first_name || cached.username || 'User');
          setLoading(false);
          return;
        }
      }
      try {
        const res = await fetch(`${API_BASE_URL}/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setCachedData(cacheKey, data);
        setFirstName(data.first_name || data.username || 'User');
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return { firstName, loading };
}
