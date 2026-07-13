import { useState, useEffect } from 'react';
import { fixImageUrl } from '@/utils/chatUtils';

import { API_BASE_URL } from '@/lib/config';

export interface CurrentUser {
  id: number;
  username: string;
  profile_picture?: string | null;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_moderator: boolean;
  moderator_rooms?: Array<{ room_id: number; room_name: string }>;
  level: string;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');
        if (!token || !userId) {
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/profile/${userId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.id,
            username: data.username,
            profile_picture: fixImageUrl(data.profile_picture),
            is_admin: data.is_admin,
            is_staff: data.is_staff,
            is_superuser: data.is_superuser,
            is_moderator: data.is_moderator,
            moderator_rooms: data.moderator_rooms,
            level: data.level,
          });
          // Store in localStorage for quick access
          localStorage.setItem('username', data.username);
          localStorage.setItem('user_level', data.level);
          localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
          localStorage.setItem('is_staff', data.is_staff ? 'true' : 'false');
          localStorage.setItem('is_superuser', data.is_superuser ? 'true' : 'false');
          localStorage.setItem('is_moderator', data.is_moderator ? 'true' : 'false');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  return { currentUser: user, loading };
};
