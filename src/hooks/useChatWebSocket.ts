import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

const WS_BASE_URL = 'wss://api.earnquestapp.com';

export const useChatWebSocket = (
  roomId: number | null,
  onMessage: (data: any) => void,
  onStatusChange?: (connected: boolean) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!roomId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please sign in to access chat');
      return;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    const wsUrl = `${WS_BASE_URL}/ws/chat/${roomId}/?token=${token}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setIsConnecting(false);
      wsRef.current = websocket;
      reconnectAttempts.current = 0;
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.onclose = (event) => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsConnecting(false);
      wsRef.current = null;
      if (event.code !== 1000 && roomId) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [roomId, onMessage]);

  useEffect(() => {
    if (roomId) connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [roomId, connect]);

  const send = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    }
  }, []);

  useEffect(() => {
    onStatusChange?.(isConnected);
  }, [isConnected, onStatusChange]);

  return { isConnected, isConnecting, send };
};
