import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

export function useWebSocket(onNotification) {
  const clientRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  const connect = useCallback(() => {
    if (!isAuthenticated || clientRef.current?.active) return;

    const token = localStorage.getItem('accessToken');
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');

        // Subscribe to user-specific notifications
        client.subscribe(`/user/${user?.id}/queue/notifications`, (message) => {
          try {
            const payload = JSON.parse(message.body);
            handleNotification(payload);
          } catch (e) {
            console.error('WS parse error', e);
          }
        });

        // Subscribe to broadcast topic
        client.subscribe('/topic/notifications', (message) => {
          try {
            const payload = JSON.parse(message.body);
            if (payload.type === 'BROADCAST') {
              toast(payload.message, { icon: '📢', duration: 6000 });
            }
          } catch (e) {
            console.error('WS broadcast parse error', e);
          }
        });

        // Subscribe to stock updates
        client.subscribe('/topic/stock', (message) => {
          try {
            const payload = JSON.parse(message.body);
            console.log('Stock update:', payload);
          } catch (e) {}
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
    });

    function handleNotification(payload) {
      const { type, title, message, orderNumber, status } = payload;

      switch (type) {
        case 'ORDER_UPDATE':
          toast.success(`Order ${orderNumber} → ${status}`, { duration: 5000, icon: '📦' });
          break;
        case 'ORDER_PLACED':
          toast.success(message || 'Order placed!', { icon: '🛒' });
          break;
        case 'ORDER_SHIPPED':
          toast.success(message || 'Your order is shipped!', { icon: '🚚' });
          break;
        case 'ORDER_DELIVERED':
          toast.success(message || 'Order delivered!', { icon: '✅' });
          break;
        case 'ORDER_CANCELLED':
          toast.error(message || 'Order cancelled', { icon: '❌' });
          break;
        default:
          toast(message || title, { duration: 4000 });
      }

      if (onNotification) onNotification(payload);
    }

    client.activate();
    clientRef.current = client;
  }, [isAuthenticated, user, onNotification]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) connect();
    else disconnect();
    return disconnect;
  }, [isAuthenticated, connect, disconnect]);

  const sendMessage = useCallback((destination, body) => {
    if (clientRef.current?.active) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  return { sendMessage, isConnected: !!clientRef.current?.active };
}
