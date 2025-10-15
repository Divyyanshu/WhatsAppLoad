import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { UserContext } from './UserContext';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { user } = useContext(UserContext);

  const setupWebSocket = useCallback(() => {
    if (!user?.WhatsAppSenderID) {
      console.log('WS: Missing sender ID, skipping setup');
      return;
    }

    const wsUrl = `wss://www.loadcrm.com/whatsappwebsocket/ws/global?senderNumber=${user.WhatsAppSenderID}&sysIpAddress=192.168.1.100&user=app`;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('WS: Already connected');
      return;
    }

    console.log('WS: Connecting to', wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log('🌐 WebSocket connected globally');
    ws.current.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.Mode === 'Received') {
          console.log('📩 Incoming global message:', msg);
          // You can dispatch event or call callback here
        }
      } catch (err) {
        console.error('WS: Message parse error', err);
      }
    };
    ws.current.onerror = err => console.error('WS Error:', err);
    ws.current.onclose = e => {
      console.warn('WS: Closed', e.code, e.reason);
      ws.current = null;
      if (e.code !== 1000 && !reconnectTimeoutRef.current) {
        console.log('WS: Attempting reconnect in 3s');
        reconnectTimeoutRef.current = setTimeout(setupWebSocket, 3000);
      }
    };
  }, [user?.WhatsAppSenderID]);

  // Initialize WebSocket once globally
  useEffect(() => {
    setupWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [setupWebSocket]);

  const closeWebSocket = () => {
    console.log('🔌 WebSocket manually closed (logout)');
    if (ws.current) {
      ws.current.close(1000, 'User logged out');
      ws.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, closeWebSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useGlobalWebSocket = () => useContext(WebSocketContext);
