import { useEffect, useRef, useCallback, useState } from 'react';

export interface WebSocketMessage {
  type: 'connection_established' | 'alert_triggered' | 'alert_created' | 'price_update' | 'wishlist_updated' | 'product_recommended' | 'heartbeat' | 'pong';
  timestamp: string;
  [key: string]: any;
}

export interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectDelay?: number;
  autoConnect?: boolean;
}

export function useWebSocket(token: string | null, options: UseWebSocketOptions = {}) {
  const {
    reconnectAttempts = 5,
    reconnectDelay = 3000,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get WebSocket URL from environment
  const getWebSocketUrl = useCallback(() => {
    const env = (import.meta as any).env || {};
    let wsBase = env.VITE_WS_URL || 'ws://localhost:8000';
    
    // Handle if VITE_API_URL is provided instead
    if (!env.VITE_WS_URL && env.VITE_API_URL) {
      const apiUrl = env.VITE_API_URL;
      wsBase = apiUrl.replace(/^https?/, 'ws');
    }

    return `${wsBase}/ws/updates/${token}`;
  }, [token]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
      return; // Already connected or connecting
    }

    try {
      const url = getWebSocketUrl();
      console.log('Connecting to WebSocket:', url);
      
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        setAttemptCount(0);

        // Start sending periodic pings
        heartbeatTimer.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Every 30 seconds
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message.type);
          setLastMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Clear heartbeat timer
        if (heartbeatTimer.current) {
          clearInterval(heartbeatTimer.current);
          heartbeatTimer.current = null;
        }

        // Attempt to reconnect
        if (attemptCount < reconnectAttempts) {
          console.log(`Attempting to reconnect (${attemptCount + 1}/${reconnectAttempts})...`);
          reconnectTimer.current = setTimeout(() => {
            setAttemptCount((prev) => prev + 1);
            connect();
          }, reconnectDelay);
        } else {
          setError('WebSocket connection failed - max reconnection attempts reached');
        }
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to WebSocket');
    }
  }, [token, getWebSocketUrl, reconnectAttempts, reconnectDelay, attemptCount]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setIsConnected(false);
  }, []);

  // Send message through WebSocket
  const send = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Connect/disconnect based on token and autoConnect
  useEffect(() => {
    if (autoConnect && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, autoConnect]);

  return {
    isConnected,
    lastMessage,
    error,
    attemptCount,
    connect,
    disconnect,
    send,
  };
}
