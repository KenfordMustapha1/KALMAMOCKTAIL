import { useEffect, useRef } from 'react';
import { getAllOrders } from '../services/orderService';
import {
  isOrderSoundEnabled,
  playNewOrderBuzzer,
  playOrderReadyBuzzer,
  playOrderCompletedBuzzer,
} from '../utils/orderSound';

const POLL_INTERVAL_MS = 12000;

/**
 * Polls orders while admin is logged in and plays fast-food style alerts
 * for new orders and status changes to Ready / Completed.
 */
const useAdminOrderAlerts = (enabled = true) => {
  const orderStateRef = useRef(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const pollOrders = async () => {
      if (!isOrderSoundEnabled()) return;

      try {
        const orders = await getAllOrders();

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

          if (!previousStatus) {
            playNewOrderBuzzer();
          } else if (previousStatus !== order.status) {
            if (order.status === 'Ready') {
              playOrderReadyBuzzer();
            } else if (order.status === 'Completed') {
              playOrderCompletedBuzzer();
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
};

export default useAdminOrderAlerts;
