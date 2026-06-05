import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDrinkById } from '../services/drinkService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

const DrinkDetailPage = () => {
  const { id } = useParams();
  const [drink, setDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDrink = async () => {
      setLoading(true);
      try {
        const data = await getDrinkById(id);
        setDrink(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDrink();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(drink, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <LoadingSpinner className="py-32" size="lg" />;
  if (error) return <div className="max-w-xl mx-auto py-20 px-4"><ErrorMessage message={error} /></div>;
  if (!drink) return null;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12 animate-fade-in pb-20">
      <Link to="/menu" className="text-kalma-muted hover:text-kalma-gold text-xs sm:text-sm mb-4 sm:mb-6 inline-block">
        ← Back to Menu
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
        <div className="card overflow-hidden">
          <img src={drink.image} alt={drink.name} className="w-full aspect-square object-cover" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-kalma-gold/10 text-kalma-gold text-xs sm:text-sm rounded-full border border-kalma-gold/30 mb-3 sm:mb-4">
            {drink.category}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">{drink.name}</h1>
          <p className="text-2xl sm:text-3xl lg:text-4xl text-kalma-gold font-semibold mb-4 sm:mb-6">{formatPrice(drink.price)}</p>
          <p className="text-kalma-muted leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">{drink.description}</p>

          {!drink.availability ? (
            <p className="text-red-400 font-medium text-sm sm:text-base">Currently unavailable</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center border border-kalma-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-kalma-muted hover:text-white transition-colors text-sm sm:text-base"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 py-3 font-medium text-sm sm:text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-kalma-muted hover:text-white transition-colors text-sm sm:text-base"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary w-full py-3 text-sm sm:text-base font-semibold">
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
              <Link to="/cart" className="btn-secondary w-full py-3 text-center text-sm sm:text-base">View Cart</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrinkDetailPage;
