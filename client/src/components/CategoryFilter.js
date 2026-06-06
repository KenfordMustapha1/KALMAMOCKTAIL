import { LayoutGrid } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { getCategoryIcon } from '../utils/categoryIcons';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onCategoryChange('')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !activeCategory
            ? 'bg-kalma-gold text-kalma-dark'
            : 'bg-kalma-card border border-kalma-border text-kalma-muted hover:border-kalma-gold/50'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.75} />
        All
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === category
              ? 'bg-kalma-gold text-kalma-dark'
              : 'bg-kalma-card border border-kalma-border text-kalma-muted hover:border-kalma-gold/50'
          }`}
        >
          {getCategoryIcon(
            category,
            `w-3.5 h-3.5 ${activeCategory === category ? 'text-kalma-dark' : 'text-kalma-gold/70'}`
          )}
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
