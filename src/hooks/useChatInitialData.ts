import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/lib/config';

export interface ChatRoom {
  id: number;
  name: string;
  description: string;
  room_type: string;
  max_participants: number;
  created_at: string;
  online_count: number;
  message_count: number;
}

export const useChatInitialData = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please sign in to access chat');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/chat/initial-data/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch chat data');
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  return { rooms, loading };
};
