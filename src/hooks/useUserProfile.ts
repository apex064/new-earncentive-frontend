import { useState, useEffect, useCallback, useRef } from 'react';
import { fixImageUrl } from '@/utils/chatUtils';

import { API_BASE_URL } from '@/lib/config';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string | null;
  level: string;
  total_earned: number;
  streak_days: number;
  date_joined: string;
  country?: string;
  current_balance: number;
  referral_earnings: number;
  total_referrals: number;
  is_admin: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_moderator?: boolean;
  moderator_rooms?: Array<{ room_id: number; room_name: string }>;
  is_online?: boolean;
  last_seen?: string;
  cover_photo?: string | null;
}

export const useUserProfile = () => {
  const [profiles, setProfiles] = useState<Map<number, UserProfile>>(new Map());
  
  // ✅ Added a ref to prevent duplicate API calls for the same user if they have multiple messages
  const fetchingRef = useRef<Set<number>>(new Set());

  const fetchUserProfile = useCallback(async (userId: number): Promise<UserProfile | null> => {
    // Check if we already have it OR if we are currently fetching it
    if (profiles.has(userId) || fetchingRef.current.has(userId)) {
      return profiles.get(userId) || null;
    }

    fetchingRef.current.add(userId); // Mark as fetching

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/profile/${userId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      const userWithFixedImage = {
        ...data,
        profile_picture: fixImageUrl(data.profile_picture),
        cover_photo: fixImageUrl(data.cover_photo),
      };
      
      // ✅ Made the Map update pure so React strictly detects the change
      setProfiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, userWithFixedImage);
        return newMap;
      });
      
      fetchingRef.current.delete(userId); // Remove from fetching queue
      return userWithFixedImage;
    } catch (error) {
      fetchingRef.current.delete(userId);
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [profiles]);

  const getProfile = useCallback((userId: number) => profiles.get(userId), [profiles]);

  return { profiles, fetchUserProfile, getProfile };
};
