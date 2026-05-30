import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPreOrder, getMyPreOrders } from '../services/preOrderService';
import { saveActivePreOrderToken } from '../utils/preOrderStorage';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [creatingQr, setCreatingQr] = useState(false);
  const [error, setError] = useState(null);
  const [activePreOrderToken, setActivePreOrderToken] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchActivePreOrders = async () => {
      try {
        const preOrders = await getMyPreOrders();
        const active = preOrders.find(
          (p) => !p.used && new Date(p.expiresAt) > new Date()
        );
        if (active) {
          setActivePreOrderToken(active.token);
          saveActivePreOrderToken(active.token);
        }
      } catch {
        // ignore — cart still works
      }
    };

    fetchActivePreOrders();
  }, [isAuthenticated]);

  const handleCreatePreOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    setCreatingQr(true);
    setError(null);
    try {
      const items = cartItems.map((item) => ({
        drink: item._id,
        quantity: item.quantity,
      }));
      const preOrder = await createPreOrder(items);
      saveActivePreOrderToken(preOrder.token);
      navigate(`/preorder/${preOrder.token}/share`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingQr(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="section-title mb-4">Your cart is empty</h1>
        <p className="text-kalma-muted mb-8">Add some delicious drinks to get started!</p>
        {activePreOrderToken && (
          <Link
            to={`/preorder/${activePreOrderToken}/share`}
            className="btn-secondary block mb-4"
          >
            View your QR pre-order
          </Link>
        )}
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="section-title mb-8">Shopping Cart</h1>

      {activePreOrderToken && (
        <div className="card p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-kalma-muted text-sm">
            You have an active QR pre-order waiting for staff to scan.
          </p>
          <Link
            to={`/preorder/${activePreOrderToken}/share`}
            className="btn-secondary text-center whitespace-nowrap"
          >
            View QR code
          </Link>
        </div>
      )}

      {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item._id} className="card flex flex-col sm:flex-row gap-4 p-4">
            <img src={item.image} alt={item.name} className="w-full sm:w-24 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{item.name}</h3>
              <p className="text-kalma-muted text-sm">{item.category}</p>
              <p className="text-kalma-gold font-medium mt-1">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-kalma-border rounded-lg">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="px-3 py-2 text-kalma-muted hover:text-white"
                >
                  −
                </button>
                <span className="px-3 py-2">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-3 py-2 text-kalma-muted hover:text-white"
                >
                  +
                </button>
              </div>
              <p className="font-semibold text-white w-20 text-right">
                {formatPrice(item.price * item.quantity)}
              </p>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-400 hover:text-red-300 p-2"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <span className="text-kalma-muted">Subtotal</span>
          <span className="text-2xl font-bold text-kalma-gold">{formatPrice(cartTotal)}</span>
        </div>
        <div className="space-y-3">
          <Link to="/checkout" className="btn-primary w-full text-center block">
            Proceed to Checkout
          </Link>
          <button
            onClick={handleCreatePreOrder}
            disabled={creatingQr}
            className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creatingQr ? <LoadingSpinner size="sm" /> : 'Create QR Pre-order'}
          </button>
          <p className="text-kalma-muted text-xs text-center">
            Save your cart as a QR code. Show it to staff at the counter to place your order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
