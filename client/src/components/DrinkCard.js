import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';

const DrinkCard = ({ drink, onAddToCart }) => {
  return (
    <div className="card group animate-slide-up">
      <Link to={`/drinks/${drink._id}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={drink.image}
            alt={drink.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        {!drink.availability && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-red-500/80 text-xs font-medium rounded">
            Unavailable
          </span>
        )}
        <span className="absolute top-3 left-3 px-2 py-1 bg-kalma-dark/80 text-kalma-gold text-xs font-medium rounded border border-kalma-gold/30">
          {drink.category}
        </span>
      </Link>
      <div className="p-4">
        <Link to={`/drinks/${drink._id}`}>
          <h3 className="font-display text-lg font-semibold text-white group-hover:text-kalma-gold transition-colors">
            {drink.name}
          </h3>
        </Link>
        <p className="text-kalma-muted text-sm mt-1 line-clamp-2">{drink.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-kalma-gold font-semibold text-lg">{formatPrice(drink.price)}</span>
          {onAddToCart && drink.availability && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(drink);
              }}
              className="px-4 py-2 text-sm bg-kalma-gold/10 text-kalma-gold border border-kalma-gold/30 rounded-lg hover:bg-kalma-gold hover:text-kalma-dark transition-all"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrinkCard;
