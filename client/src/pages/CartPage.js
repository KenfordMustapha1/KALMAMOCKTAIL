import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="section-title mb-4">Your cart is empty</h1>
        <p className="text-kalma-muted mb-8">Add some delicious drinks to get started!</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="section-title mb-8">Shopping Cart</h1>

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
        <Link to="/checkout" className="btn-primary w-full text-center block">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
