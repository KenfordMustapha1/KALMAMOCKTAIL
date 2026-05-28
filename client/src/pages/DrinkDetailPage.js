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
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <Link to="/menu" className="text-kalma-muted hover:text-kalma-gold text-sm mb-6 inline-block">
        ← Back to Menu
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="card overflow-hidden">
          <img src={drink.image} alt={drink.name} className="w-full aspect-square object-cover" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-kalma-gold/10 text-kalma-gold text-sm rounded-full border border-kalma-gold/30 mb-4">
            {drink.category}
          </span>
          <h1 className="font-display text-4xl font-bold text-white mb-4">{drink.name}</h1>
          <p className="text-3xl text-kalma-gold font-semibold mb-6">{formatPrice(drink.price)}</p>
          <p className="text-kalma-muted leading-relaxed mb-8">{drink.description}</p>

          {!drink.availability ? (
            <p className="text-red-400 font-medium">Currently unavailable</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center border border-kalma-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-kalma-muted hover:text-white transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-3 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-kalma-muted hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1 sm:flex-none">
                {added ? 'Added ✓' : 'Add to Cart'}
              </button>
              <Link to="/cart" className="btn-secondary">View Cart</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrinkDetailPage;
