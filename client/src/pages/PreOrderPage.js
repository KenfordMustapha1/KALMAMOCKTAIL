import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPreOrderByToken } from '../services/preOrderService';
import { useAuth } from '../context/AuthContext';
import { getAdminScanUrl, getQrImageUrl } from '../utils/preOrderUtils';
import {
  saveActivePreOrderToken,
  clearActivePreOrderToken,
} from '../utils/preOrderStorage';
import { formatPrice, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PreOrderRedeemPage = () => {
  const { token } = useParams();
  const { isAuthenticated } = useAuth();
  const [preOrder, setPreOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        const data = await getPreOrderByToken(token);
        setPreOrder(data);
        if (!data.expired) {
          saveActivePreOrderToken(token);
        } else {
          clearActivePreOrderToken();
        }
      } catch (err) {
        clearActivePreOrderToken();
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPreOrder();
  }, [token]);

  if (loading) return <LoadingSpinner className="py-32" size="lg" />;

  if (error && !preOrder) {
    return (
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-12 sm:py-20 text-center min-h-screen flex flex-col items-center justify-center">
        <ErrorMessage message={error} />
        <Link to="/menu" className="btn-primary mt-6 inline-block text-sm sm:text-base py-2.5 sm:py-3">Browse Menu</Link>
      </div>
    );
  }

  const total = preOrder.items.reduce(
    (sum, item) => sum + item.drink.price * item.quantity,
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12 animate-fade-in pb-20">
      <h1 className="section-title mb-1 sm:mb-2 text-2xl sm:text-4xl">Your Pre-order</h1>
      <p className="text-kalma-muted mb-4 sm:mb-8 text-sm sm:text-base">
        Show your QR code to staff at the counter. They will scan it to place your order.
      </p>

      {preOrder.used && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-green-400 text-sm sm:text-base">
          This pre-order has been placed. Check your order history for status updates.
        </div>
      )}

      {preOrder.expired && !preOrder.used && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-red-400 text-sm sm:text-base">
          This pre-order has expired. Please create a new one from your cart.
        </div>
      )}

      <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-4 text-xs sm:text-sm text-kalma-muted">
          <span>Customer: {preOrder.user?.name}</span>
          <span>Expires: {formatDate(preOrder.expiresAt)}</span>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {preOrder.items.map((item) => (
            <div key={item.drink._id} className="flex justify-between text-xs sm:text-sm">
              <span className="text-kalma-muted">
                {item.drink.name} × {item.quantity}
              </span>
              <span className="text-white font-medium">
                {formatPrice(item.drink.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-kalma-border mt-4 pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
          <span className="font-semibold text-white text-sm">Total</span>
          <span className="text-2xl sm:text-3xl font-bold text-kalma-gold">{formatPrice(total)}</span>
        </div>
      </div>

      {!preOrder.used && !preOrder.expired && (
        <div className="card p-4 sm:p-6 text-center mb-4">
          <p className="text-kalma-muted text-xs sm:text-sm mb-2">Waiting for staff to scan your QR</p>
          <Link to={`/preorder/${token}/share`} className="text-kalma-gold hover:underline text-xs sm:text-sm font-medium">
            View your QR code
          </Link>
        </div>
      )}

      {isAuthenticated && (
        <Link to="/orders" className="block text-center text-kalma-muted hover:text-white mt-4 sm:mt-6 text-xs sm:text-sm">
          View order history
        </Link>
      )}

      <Link to="/menu" className="block text-center text-kalma-muted hover:text-white mt-2 text-xs sm:text-sm">
        Back to menu
      </Link>
    </div>
  );
};

const PreOrderSharePage = () => {
  const { token } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [preOrder, setPreOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPreOrder = async () => {
      try {
        const data = await getPreOrderByToken(token);
        setPreOrder(data);
        if (!data.expired) {
          saveActivePreOrderToken(token);
        } else {
          clearActivePreOrderToken();
        }
      } catch (err) {
        clearActivePreOrderToken();
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPreOrder();
  }, [token]);

  const staffScanUrl = getAdminScanUrl(token);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(staffScanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner className="py-32" size="lg" />;

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="section-title mb-4">Sign in required</h1>
        <Link
          to="/login"
          state={{ from: { pathname: `/preorder/${token}/share` } }}
          className="btn-primary"
        >
          Login
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ErrorMessage message={error} />
        <p className="text-kalma-muted text-sm mt-4">
          If staff already scanned your QR, your order was placed. Check order history.
        </p>
        <Link to="/orders" className="btn-primary mt-6 inline-block">View orders</Link>
        <Link to="/cart" className="block text-kalma-muted hover:text-white mt-4 text-sm">
          Back to cart
        </Link>
      </div>
    );
  }

  const total = preOrder.items.reduce(
    (sum, item) => sum + item.drink.price * item.quantity,
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in text-center">
      <h1 className="section-title mb-2">Your Pre-order QR</h1>
      <p className="text-kalma-muted mb-8">
        Show this QR to staff at the counter. They will scan it to place your order. Valid for 24 hours.
      </p>

      <div className="card p-8 inline-block mb-6">
        <div className="bg-white p-4 rounded-lg inline-block">
          <img
            src={getQrImageUrl(staffScanUrl)}
            alt="Pre-order QR code for staff to scan"
            width={220}
            height={220}
            className="block"
          />
        </div>
      </div>

      <div className="card p-6 mb-6 text-left">
        <h2 className="font-semibold text-white mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {preOrder.items.map((item) => (
            <div key={item.drink._id} className="flex justify-between text-sm">
              <span className="text-kalma-muted">
                {item.drink.name} × {item.quantity}
              </span>
              <span className="text-white">
                {formatPrice(item.drink.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-kalma-border pt-4 flex justify-between">
          <span className="font-semibold text-white">Total</span>
          <span className="text-kalma-gold font-bold">{formatPrice(total)}</span>
        </div>
        <p className="text-kalma-muted text-sm mt-4">
          Expires: {formatDate(preOrder.expiresAt)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={handleCopy} className="btn-secondary">
          {copied ? 'Link copied!' : 'Copy staff link'}
        </button>
        <Link to={`/preorder/${token}`} className="btn-primary">
          View pre-order status
        </Link>
      </div>
    </div>
  );
};

export { PreOrderRedeemPage, PreOrderSharePage };
