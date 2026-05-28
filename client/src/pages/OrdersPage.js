import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { formatPrice, formatDate } from '../utils/formatters';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const successMessage = location.state?.message;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner className="py-32" size="lg" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="section-title mb-8">Order History</h1>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 text-green-400">
          {successMessage}
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {orders.length === 0 ? (
        <p className="text-kalma-muted text-center py-12">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-kalma-muted text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-kalma-muted text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-kalma-muted">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-kalma-border pt-4 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="text-kalma-gold font-bold">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
