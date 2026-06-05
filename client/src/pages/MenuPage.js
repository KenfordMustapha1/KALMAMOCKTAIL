import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDrinks } from '../services/drinkService';
import DrinkCard from '../components/DrinkCard';
import CategoryFilter from '../components/CategoryFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  const activeCategory = searchParams.get('category') || '';

  const fetchDrinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { available: 'true' };
      if (activeCategory) params.category = activeCategory;
      const data = await getDrinks(params);
      setDrinks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10 animate-fade-in">
        <h1 className="section-title mb-2 sm:mb-3 text-2xl sm:text-4xl">Our Menu</h1>
        <p className="text-kalma-muted text-sm sm:text-base">Handcrafted beverages for every taste</p>
      </div>

      <div className="mb-8 sm:mb-10">
        <CategoryFilter activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
      </div>

      {loading ? (
        <LoadingSpinner className="py-12 sm:py-20" size="lg" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchDrinks} />
      ) : drinks.length === 0 ? (
        <p className="text-center text-kalma-muted py-12 sm:py-16 text-sm sm:text-base">No drinks found in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {drinks.map((drink) => (
            <DrinkCard key={drink._id} drink={drink} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
