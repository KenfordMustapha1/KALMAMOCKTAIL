import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDrinks } from '../services/drinkService';
import DrinkCard from '../components/DrinkCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../utils/constants';

const LandingPage = () => {
  const [featuredDrinks, setFeaturedDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const adVideos = ['/video/sunrise.mp4', '/video/sirencloud.mp4'];
  const [adVideoIndex, setAdVideoIndex] = useState(0);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const drinks = await getDrinks({ available: 'true' });
        setFeaturedDrinks(drinks.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrinks();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setAdVideoIndex((i) => (i + 1) % adVideos.length);
    }, 12000);
    return () => window.clearInterval(id);
  }, [adVideos.length]);

  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center justify-center bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <video
            key={adVideos[adVideoIndex]}
            className="w-full h-full object-cover"
            autoPlay
            controls
            muted={false}
            playsInline
            preload="metadata"
            onEnded={() => setAdVideoIndex((i) => (i + 1) % adVideos.length)}
          >
            <source src={adVideos[adVideoIndex]} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />
        </div>

        <div className="absolute inset-0 bg-gradient-radial from-kalma-gold/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-kalma-gold/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-fade-in">
          <p className="text-kalma-gold text-sm tracking-[0.3em] uppercase mb-4">Premium Beverages</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
            <span className="gold-gradient-text">KALMA</span>
            <span className="text-white"> MIXTAIL</span>
          </h1>
          <p className="text-kalma-muted text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover artisan dirty sodas, refreshing mocktails, and handcrafted cocktails.
            Every sip tells a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="btn-primary">Explore Menu</Link>
            <Link to="/register" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-4">Our Categories</h2>
          <p className="text-kalma-muted text-center mb-12 max-w-xl mx-auto">
            Three distinct collections, one unforgettable experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category}
                to={`/menu?category=${encodeURIComponent(category)}`}
                className="card p-8 text-center group hover:scale-[1.02] transition-transform animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-kalma-gold/10 flex items-center justify-center group-hover:bg-kalma-gold/20 transition-colors">
                  <span className="text-2xl">
                    {category === 'Dirty Soda' ? '🥤' : category === 'Mocktail' ? '🍹' : '🍸'}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-white group-hover:text-kalma-gold transition-colors">
                  {category}
                </h3>
                <p className="text-kalma-muted text-sm mt-2">View collection →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-kalma-darker/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-12">Featured Drinks</h2>
          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDrinks.map((drink) => (
                <DrinkCard key={drink._id} drink={drink} onAddToCart={addToCart} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/menu" className="btn-secondary">View Full Menu</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
