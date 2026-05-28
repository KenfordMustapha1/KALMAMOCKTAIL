import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="section-title mb-4">Sign in to checkout</h1>
        <p className="text-kalma-muted mb-8">Please log in or create an account to place your order.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="btn-primary">Login</Link>
          <Link to="/register" className="btn-secondary">Register</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="section-title mb-4">Nothing to checkout</h1>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
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
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="section-title mb-8">Checkout</h1>

      {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Order Summary</h2>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between text-sm">
              <span className="text-kalma-muted">
                {item.name} × {item.quantity}
              </span>
              <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-kalma-border mt-4 pt-4 flex justify-between">
          <span className="font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-kalma-gold">{formatPrice(cartTotal)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Place Order'}
      </button>
    </div>
  );
};

export default CheckoutPage;
