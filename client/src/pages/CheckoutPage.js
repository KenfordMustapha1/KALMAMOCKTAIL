import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { CreditCard } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-12 sm:py-20 text-center min-h-screen flex flex-col items-center justify-center">
        <h1 className="section-title mb-3 sm:mb-4 text-2xl sm:text-4xl">Sign in to checkout</h1>
        <p className="text-kalma-muted mb-6 sm:mb-8 text-sm sm:text-base">Please log in or create an account to place your order.</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto">
          <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="btn-primary flex-1 sm:flex-none py-2.5 sm:py-3 text-sm sm:text-base">Login</Link>
          <Link to="/register" className="btn-secondary flex-1 sm:flex-none py-2.5 sm:py-3 text-sm sm:text-base">Register</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-12 sm:py-20 text-center min-h-screen flex flex-col items-center justify-center">
        <h1 className="section-title mb-4 sm:mb-6 text-2xl sm:text-4xl">Nothing to checkout</h1>
        <Link to="/menu" className="btn-primary w-full sm:w-auto py-2.5 sm:py-3 text-sm sm:text-base">Browse Menu</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = cartItems.map((item) => ({
        drink: item._id,
        quantity: item.quantity,
      }));
      await createOrder({ items });
      clearCart();
      navigate('/orders', { state: { message: 'Order placed successfully!' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12 animate-fade-in pb-24">
      <h1 className="section-title mb-6 sm:mb-8 text-2xl sm:text-4xl">Checkout</h1>

      {error && <div className="mb-4 sm:mb-6"><ErrorMessage message={error} /></div>}

      <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="font-semibold text-white mb-4 text-base sm:text-lg">Order Summary</h2>
        <div className="space-y-2 sm:space-y-3">
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between text-xs sm:text-sm">
              <span className="text-kalma-muted">
                {item.name} × {item.quantity}
              </span>
              <span className="text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-kalma-border mt-4 pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
          <span className="font-semibold text-white text-sm sm:text-base">Total</span>
          <span className="text-2xl sm:text-3xl font-bold text-kalma-gold">{formatPrice(cartTotal)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 py-3 sm:py-3 text-sm sm:text-base"
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <CreditCard className="w-4 h-4" strokeWidth={1.75} />
            Place Order
          </>
        )}
      </button>
    </div>
  );
};

export default CheckoutPage;
