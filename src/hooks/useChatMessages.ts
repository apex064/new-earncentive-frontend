import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/lib/config';

export interface ChatMessage {
  id: number;
  room: number;
  user: number;
  username: string;
  user_level: string;
  message_type: string;
  content: string;
  image: string | null;
  video: string | null;
  audio: string | null;
  file: string | null;
  file_name: string | null;
  file_size: number;
  file_type: string;
  file_url: string | null;
  thumbnail_url: string | null;
  reply_to: number | null;
  reply_to_username: string | null;
  reply_to_content: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export const useChatMessages = (roomId: number | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const messagesData = Array.isArray(data) ? data : data.results || data.messages || [];
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const sendMessage = async (content: string, media: any = null, replyToId: number | null = null) => {
    if (!roomId) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (content.trim()) formData.append('content', content.trim());
      if (replyToId) formData.append('reply_to', replyToId.toString());
      if (media) {
        formData.append(media.type, media.file);
        if (media.type === 'file') formData.append('file_name', media.file.name);
      }
      const res = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/send-message/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }
      // Message will arrive via WebSocket, so no need to update state here
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
      throw error;
    }
  };

  const editMessage = async (messageId: number, newContent: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/edit/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error('Failed to edit message');
      toast.success('Message updated');
    } catch (error: any) {
      console.error('Error editing message:', error);
      toast.error(error.message || 'Failed to edit message');
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const searchMessages = async (query: string) => {
    if (!roomId || !query.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_BASE_URL}/chat/rooms/${roomId}/search/?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || data.messages || [];
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast.error('Search failed');
    }
  };

  useEffect(() => {
    if (roomId) fetchMessages();
  }, [roomId, fetchMessages]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const updateMessage = useCallback((messageId: number, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
    );
  }, []);

  const removeMessage = useCallback((messageId: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, is_deleted: true, content: '[Message deleted]', image: null, video: null, audio: null, file: null }
          : m
      )
    );
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    searchMessages,
    searchResults,
    showSearchResults,
    setShowSearchResults,
    addMessage,
    updateMessage,
    removeMessage,
  };
};
