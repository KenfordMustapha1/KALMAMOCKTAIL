import { CATEGORIES } from '../utils/constants';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !activeCategory
            ? 'bg-kalma-gold text-kalma-dark'
            : 'bg-kalma-card border border-kalma-border text-kalma-muted hover:border-kalma-gold/50'
        }`}
      >
        All
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === category
              ? 'bg-kalma-gold text-kalma-dark'
              : 'bg-kalma-card border border-kalma-border text-kalma-muted hover:border-kalma-gold/50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
