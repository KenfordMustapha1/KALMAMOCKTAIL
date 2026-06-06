import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { Bell } from 'lucide-react';
import CustomerOrderSoundToggle from '../components/CustomerOrderSoundToggle';
import { formatPrice, formatDate } from '../utils/formatters';
import { unlockOrderSound } from '../utils/orderSound';

const POLL_INTERVAL_MS = 10000;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const successMessage = location.state?.message;

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    unlockOrderSound();

    const intervalId = setInterval(() => fetchOrders(false), POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  if (loading) return <LoadingSpinner className="py-32" size="lg" />;

  const hasReadyOrder = orders.some((o) => o.status === 'Ready');

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12 animate-fade-in pb-24">
      <h1 className="section-title mb-6 sm:mb-8 text-2xl sm:text-4xl">Order History</h1>

      <div className="mb-4 sm:mb-6">
        <CustomerOrderSoundToggle />
      </div>

      {hasReadyOrder && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-purple-200 animate-pulse">
          <p className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
            <Bell className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            Your order is ready for pickup!
          </p>
          <p className="text-xs sm:text-sm mt-1 opacity-90">Please come to the counter.</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-green-400 text-sm sm:text-base">
          {successMessage}
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {orders.length === 0 ? (
        <p className="text-kalma-muted text-center py-12 sm:py-16 text-sm sm:text-base">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`card p-4 sm:p-6 ${
                order.status === 'Ready'
                  ? 'ring-2 ring-purple-500/50 border-purple-500/30'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <p className="text-kalma-muted text-xs sm:text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-kalma-muted text-xs sm:text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              {order.status === 'Ready' && (
                <p className="text-purple-300 text-xs sm:text-sm font-medium mb-3">
                  Ready for pickup — please collect at the counter
                </p>
              )}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-kalma-muted">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-kalma-border pt-3 sm:pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                <span className="font-semibold text-white text-sm">Total</span>
                <span className="text-xl sm:text-2xl text-kalma-gold font-bold">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-kalma-muted text-xs text-center mt-8 leading-relaxed">
        Status updates every few seconds. Keep this page open or browse the site — you&apos;ll hear a buzz when your order is ready.
      </p>
    </div>
  );
};

export default OrdersPage;
