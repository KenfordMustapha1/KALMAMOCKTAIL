import { useEffect, useRef, useState, useCallback } from 'react';
import { getMyOrders } from '../services/orderService';
import {
  isOrderSoundEnabled,
  playOrderReadyBuzzer,
  playOrderCompletedBuzzer,
} from '../utils/orderSound';

const POLL_INTERVAL_MS = 10000;

const useCustomerOrderAlerts = (enabled = true) => {
  const orderStateRef = useRef(new Map());
  const initializedRef = useRef(false);
  const [alert, setAlert] = useState(null);

  const dismissAlert = useCallback(() => setAlert(null), []);

  useEffect(() => {
    if (!enabled) return undefined;

    const pollOrders = async () => {
      try {
        const orders = await getMyOrders();

        if (!initializedRef.current) {
          orders.forEach((order) => {
            orderStateRef.current.set(order._id, order.status);
          });
          initializedRef.current = true;
          return;
        }

        const currentIds = new Set();

        orders.forEach((order) => {
          currentIds.add(order._id);
          const previousStatus = orderStateRef.current.get(order._id);

          if (previousStatus && previousStatus !== order.status) {
            if (order.status === 'Ready') {
              if (isOrderSoundEnabled()) {
                playOrderReadyBuzzer();
              }
              setAlert({
                type: 'ready',
                orderId: order._id,
                message: 'Your order is ready for pickup!',
              });
            } else if (order.status === 'Completed') {
              if (isOrderSoundEnabled()) {
                playOrderCompletedBuzzer();
              }
              setAlert({
                type: 'completed',
                orderId: order._id,
                message: 'Your order is complete. Thank you!',
              });
            }
          }

          orderStateRef.current.set(order._id, order.status);
        });

        orderStateRef.current.forEach((_, id) => {
          if (!currentIds.has(id)) {
            orderStateRef.current.delete(id);
          }
        });
      } catch {
        // ignore polling errors
      }
    };

    pollOrders();
    const intervalId = setInterval(pollOrders, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [enabled]);

  useEffect(() => {
    if (!alert) return undefined;

    const timeoutId = setTimeout(() => setAlert(null), 15000);
    return () => clearTimeout(timeoutId);
  }, [alert]);

  return { alert, dismissAlert };
};

export default useCustomerOrderAlerts;
