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
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-12 sm:py-20 text-center animate-fade-in min-h-screen flex flex-col items-center justify-center">
        <div className="text-5xl sm:text-6xl mb-4">🛒</div>
        <h1 className="section-title mb-3 sm:mb-4 text-2xl sm:text-4xl">Your cart is empty</h1>
        <p className="text-kalma-muted mb-6 sm:mb-8 text-sm sm:text-base">Add some delicious drinks to get started!</p>
        {activePreOrderToken && (
          <Link
            to={`/preorder/${activePreOrderToken}/share`}
            className="btn-secondary block mb-3 w-full sm:w-auto"
          >
            View your QR pre-order
          </Link>
        )}
        <Link to="/menu" className="btn-primary w-full sm:w-auto">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12 animate-fade-in pb-24">
      <h1 className="section-title mb-6 sm:mb-8 text-2xl sm:text-4xl">Shopping Cart</h1>

      {activePreOrderToken && (
        <div className="card p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-kalma-muted text-xs sm:text-sm">
            You have an active QR pre-order waiting for staff to scan.
          </p>
          <Link
            to={`/preorder/${activePreOrderToken}/share`}
            className="btn-secondary text-center whitespace-nowrap text-sm py-2 px-4"
          >
            View QR code
          </Link>
        </div>
      )}

      {error && <div className="mb-4 sm:mb-6"><ErrorMessage message={error} /></div>}

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {cartItems.map((item) => (
          <div key={item._id} className="card flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4">
            <img src={item.image} alt={item.name} className="w-full sm:w-24 h-24 object-cover rounded-lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm sm:text-base truncate">{item.name}</h3>
              <p className="text-kalma-muted text-xs sm:text-sm">{item.category}</p>
              <p className="text-kalma-gold font-medium mt-1 sm:mt-2 text-sm sm:text-base">{formatPrice(item.price)}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center border border-kalma-border rounded-lg">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="px-3 py-2 text-kalma-muted hover:text-white transition-colors text-base sm:text-sm"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-3 py-2 text-sm sm:text-base font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-3 py-2 text-kalma-muted hover:text-white transition-colors text-base sm:text-sm"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <p className="font-semibold text-white text-right text-sm sm:text-base min-w-fit">
                {formatPrice(item.price * item.quantity)}
              </p>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-400 hover:text-red-300 p-2 transition-colors self-end sm:self-auto"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
          <span className="text-kalma-muted text-sm">Subtotal</span>
          <span className="text-2xl sm:text-3xl font-bold text-kalma-gold">{formatPrice(cartTotal)}</span>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Link to="/checkout" className="btn-primary w-full text-center block text-sm sm:text-base py-2.5 sm:py-3">
            Proceed to Checkout
          </Link>
          <button
            onClick={handleCreatePreOrder}
            disabled={creatingQr}
            className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base py-2.5 sm:py-3"
          >
            {creatingQr ? <LoadingSpinner size="sm" /> : 'Create QR Pre-order'}
          </button>
          <p className="text-kalma-muted text-xs sm:text-sm text-center leading-relaxed">
            Save your cart as a QR code. Show it to staff at the counter to place your order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
