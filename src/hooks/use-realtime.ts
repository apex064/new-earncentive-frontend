// Real-time WebSocket connections for balance & notifications
// Mirrors crypt's logged-in-header WebSocket implementation

import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { NOTIFICATIONS_QUERY_KEY } from "@/hooks/use-notifications";

const WS_BASE_URL = "wss://api.earnquestapp.com";

const RECONNECT_DELAY = 5000;
const FALLBACK_TIMEOUT = 5000;
const HEARTBEAT_INTERVAL = 30000;

/** Connection state for external consumers */
export type WsConnectionState = {
  notificationsConnected: boolean;
  balanceConnected: boolean;
};

// Global singleton state + listeners for reactive updates
let globalWsState: WsConnectionState = {
  notificationsConnected: false,
  balanceConnected: false,
};
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const fn of listeners) fn();
}

function subscribeToWsState(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getWsStateSnapshot(): WsConnectionState {
  return globalWsState;
}

/** Clean up a WebSocket reference */
function closeSocket(ref: React.MutableRefObject<WebSocket | null>) {
  if (ref.current) {
    ref.current.onclose = null;
    ref.current.onerror = null;
    ref.current.onmessage = null;
    ref.current.close();
    ref.current = null;
  }
}

/**
 * Hook: connects to both balance and notifications WebSockets.
 * - Balance updates → invalidate user query so balance pill refreshes
 * - Notification updates → invalidate notifications query
 * - Falls back to polling via React Query refetchInterval
 *
 * Mount this once in the dashboard layout.
 */
export function useRealtimeConnections() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const notifWsRef = useRef<WebSocket | null>(null);
  const balanceWsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    closeSocket(notifWsRef);
    closeSocket(balanceWsRef);
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    globalWsState.notificationsConnected = false;
    globalWsState.balanceConnected = false;
    notifyListeners();
  }, []);

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      cleanup();

      // Fallback timer: if WS doesn't open in 5s, rely on REST polling
      fallbackRef.current = setTimeout(() => {
        if (
          notifWsRef.current?.readyState !== WebSocket.OPEN &&
          balanceWsRef.current?.readyState !== WebSocket.OPEN
        ) {
          console.log("[WS] WebSocket fallback — using REST polling");
        }
      }, FALLBACK_TIMEOUT);

      // ─── Notifications WebSocket ───
      const notifWs = new WebSocket(
        `${WS_BASE_URL}/ws/notifications/?token=${token}`,
      );
      notifWsRef.current = notifWs;

      notifWs.onopen = () => {
        console.log("[WS] Notifications connected");
        globalWsState.notificationsConnected = true;
        notifyListeners();
      };

      notifWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const notification = data.notification || data;
          if (notification.action && !notification.is_read) {
            queryClient.invalidateQueries({
              queryKey: NOTIFICATIONS_QUERY_KEY,
            });
          }
        } catch {
          // ignore parse errors
        }
      };

      notifWs.onerror = () => {
        globalWsState.notificationsConnected = false;
        notifyListeners();
      };

      notifWs.onclose = (event) => {
        console.log("[WS] Notifications closed:", event.code);
        globalWsState.notificationsConnected = false;
        notifyListeners();

        if (event.code !== 1000) {
          reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      // ─── Balance WebSocket ───
      const balanceWs = new WebSocket(
        `${WS_BASE_URL}/ws/user/?token=${token}`,
      );
      balanceWsRef.current = balanceWs;

      balanceWs.onopen = () => {
        console.log("[WS] Balance connected");
        globalWsState.balanceConnected = true;
        notifyListeners();
      };

      balanceWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "balance_update") {
            queryClient.invalidateQueries({ queryKey: ["user"] });
          }
        } catch {
          // ignore
        }
      };

      balanceWs.onerror = () => {
        globalWsState.balanceConnected = false;
        notifyListeners();
      };

      balanceWs.onclose = (event) => {
        console.log("[WS] Balance closed:", event.code);
        globalWsState.balanceConnected = false;
        notifyListeners();

        if (event.code !== 1000) {
          reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };
    };

    connect();

    // Heartbeat: keep both connections alive
    heartbeatRef.current = setInterval(() => {
      if (notifWsRef.current?.readyState === WebSocket.OPEN) {
        notifWsRef.current.send(JSON.stringify({ type: "ping" }));
      }
      if (balanceWsRef.current?.readyState === WebSocket.OPEN) {
        balanceWsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);

    return cleanup;
  }, [token, cleanup, queryClient]);
}

/**
 * Reactive hook: subscribe to WebSocket connection state changes.
 * Components re-render when balanceConnected or notificationsConnected changes.
 */
export function useWsConnectionState(): WsConnectionState {
  return useSyncExternalStore(subscribeToWsState, getWsStateSnapshot);
}
