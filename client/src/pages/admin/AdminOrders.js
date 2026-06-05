import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
} from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice, formatDate } from '../../utils/formatters';
import { playOrderReadyBuzzer, playOrderCompletedBuzzer } from '../../utils/orderSound';

const getCustomerLabel = (order) => {
  if (order.user?.name) return order.user.name;
  if (order.walkInName) return order.walkInName;
  return 'Unknown customer';
};

const getCustomerSubLabel = (order) => {
  if (order.user?.email) return order.user.email;
  if (order.walkInName) return 'Walk-in customer';
  return '';
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [updatingPayment, setUpdatingPayment] = useState(null);
  const location = useLocation();
  const successMessage = location.state?.message;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));

      if (status === 'Ready') {
        playOrderReadyBuzzer();
      } else if (status === 'Completed') {
        playOrderCompletedBuzzer();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handlePaymentChange = async (orderId, isPaid) => {
    setUpdatingPayment(orderId);
    setError(null);
    try {
      const updated = await updateOrderPayment(orderId, isPaid);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingPayment(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this completed order permanently?')) return;

    setDeleting(orderId);
    setError(null);
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <div className="animate-fade-in px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-3 sm:px-0">
        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Orders</h1>
        <Link to="/admin/orders/new" className="btn-primary text-xs sm:text-sm py-2 sm:py-3 px-4 sm:px-6 w-full sm:w-auto text-center">
          + Manual order
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-green-400 text-sm sm:text-base">
          {successMessage}
        </div>
      )}
      {error && <div className="mb-4"><ErrorMessage message={error} onRetry={fetchOrders} /></div>}

      {orders.length === 0 ? (
        <p className="text-kalma-muted text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">{getCustomerLabel(order)}</p>
                  <p className="text-kalma-muted text-xs sm:text-sm">{getCustomerSubLabel(order)}</p>
                  <p className="text-kalma-muted text-xs mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {order.orderType === 'qr_preorder' && (
                    <span className="text-xs px-2 py-1 rounded bg-kalma-gold/20 text-kalma-gold border border-kalma-gold/30">
                      QR Pre-order
                    </span>
                  )}
                  {(order.orderType === 'walk_in' || order.orderType === 'admin_manual') && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Counter
                    </span>
                  )}
                  <StatusBadge status={order.status} />
                  {order.status === 'Completed' && (
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        order.isPaid
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      {order.isPaid === true ? 'Paid' : 'Unpaid'}
                    </span>
                  )}
                  <span className="text-kalma-gold font-bold text-sm">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>

              <div className="space-y-0.5 sm:space-y-1 mb-3 sm:mb-4 text-xs sm:text-sm max-h-32 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-kalma-muted">
                    {item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                  </p>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
                {ORDER_STATUSES.map((orderStatus) => (
                  <button
                    key={orderStatus}
                    onClick={() => handleStatusChange(order._id, orderStatus)}
                    disabled={updating === order._id || order.status === orderStatus}
                    className={`px-2 sm:px-3 py-1 text-xs rounded-lg border transition-all whitespace-nowrap ${
                      order.status === orderStatus
                        ? 'bg-kalma-gold text-kalma-dark border-kalma-gold'
                        : 'border-kalma-border text-kalma-muted hover:border-kalma-gold/50 disabled:opacity-50'
                    }`}
                  >
                    {orderStatus}
                  </button>
                ))}
                {order.status === 'Completed' && (
                  <>
                    <button
                      onClick={() => handlePaymentChange(order._id, true)}
                      disabled={updatingPayment === order._id || order.isPaid === true}
                      className={`px-2 sm:px-3 py-1 text-xs rounded-lg border transition-all disabled:opacity-50 whitespace-nowrap ${
                        order.isPaid === true
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'border-kalma-border text-kalma-muted hover:border-green-500/50 hover:text-green-400'
                      }`}
                    >
                      {updatingPayment === order._id ? 'Saving...' : 'Paid'}
                    </button>
                    <button
                      onClick={() => handlePaymentChange(order._id, false)}
                      disabled={updatingPayment === order._id || order.isPaid !== true}
                      className={`px-2 sm:px-3 py-1 text-xs rounded-lg border transition-all disabled:opacity-50 whitespace-nowrap ${
                        order.isPaid !== true
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          : 'border-kalma-border text-kalma-muted hover:border-orange-500/50 hover:text-orange-400'
                      }`}
                    >
                      {updatingPayment === order._id ? 'Saving...' : 'Unpaid'}
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      disabled={deleting === order._id}
                      className="px-2 sm:px-3 py-1 text-xs rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50 ml-auto whitespace-nowrap"
                    >
                      {deleting === order._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
