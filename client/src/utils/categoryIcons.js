import { CupSoda, Martini, Wine } from 'lucide-react';

export const getCategoryIcon = (category, className = 'w-6 h-6 sm:w-7 sm:h-7 text-kalma-gold') => {
  switch (category) {
    case 'Dirty Soda':
      return <CupSoda className={className} strokeWidth={1.75} />;
    case 'Mocktail':
      return <Martini className={className} strokeWidth={1.75} />;
    case 'Cocktail':
      return <Wine className={className} strokeWidth={1.75} />;
    default:
      return <CupSoda className={className} strokeWidth={1.75} />;
  }
};
