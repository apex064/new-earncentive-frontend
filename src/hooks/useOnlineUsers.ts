import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fixImageUrl } from '@/utils/chatUtils';

import { API_BASE_URL } from '@/lib/config';

export interface OnlineUser {
  id: number;
  username: string;
  user_level: string;
  is_online: boolean;
  last_seen: string;
  profile_picture?: string | null;
  is_admin?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_moderator?: boolean;
  moderator_rooms?: Array<{ room_id: number; room_name: string }>;
}

export const useOnlineUsers = (roomId: number | null, currentUserId?: number) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnlineUsers = useCallback(async () => {
    if (!roomId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/all-online-users/`, {
        headers: { Authorization: `Token ${token}` },
      });
      let users: OnlineUser[] = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) users = data;
      }
      // Normalize IDs and ensure all users have fixed image URLs
      users = users.map((u) => ({
        ...u,
        id: Number(u.id),
        profile_picture: fixImageUrl(u.profile_picture),
      }));
      // Add current user if not present
      if (currentUserId && !users.some((u) => u.id === currentUserId)) {
        // Current user info is already in localStorage; we'll let WebSocket add them later
      }
      setOnlineUsers(users);
    } catch (error) {
      console.error('Error fetching online users:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId, currentUserId]);

  useEffect(() => {
    if (roomId) fetchOnlineUsers();
  }, [roomId, fetchOnlineUsers]);

  const addUser = useCallback((user: OnlineUser) => {
    const normalizedUser = { ...user, id: Number(user.id) };
    setOnlineUsers((prev) => {
      if (prev.some((u) => u.id === normalizedUser.id)) return prev;
      return [...prev, normalizedUser];
    });
  }, []);

  const updateUserStatus = useCallback((userId: number, isOnline: boolean, lastSeen?: string) => {
    const normalizedId = Number(userId);
    setOnlineUsers((prev) =>
      prev.map((u) =>
        u.id === normalizedId ? { ...u, is_online: isOnline, last_seen: lastSeen || u.last_seen } : u
      )
    );
  }, []);

  const removeUser = useCallback((userId: number) => {
    setOnlineUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  return {
    onlineUsers,
    loading,
    addUser,
    updateUserStatus,
    removeUser,
    fetchOnlineUsers,
  };
};
