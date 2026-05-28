import { Link } from 'react-router-dom';
import { CATEGORIES } from '../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-kalma-darker border-t border-kalma-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-2xl font-bold gold-gradient-text mb-3">KALMA MIXTAIL</h3>
            <p className="text-kalma-muted text-sm leading-relaxed">
              Premium dirty sodas, mocktails, and cocktails crafted with care.
              Order online and experience the art of mixology.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/menu?category=${encodeURIComponent(cat)}`}
                    className="text-kalma-muted hover:text-kalma-gold text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/menu" className="text-kalma-muted hover:text-kalma-gold text-sm transition-colors">Menu</Link></li>
              <li><Link to="/cart" className="text-kalma-muted hover:text-kalma-gold text-sm transition-colors">Cart</Link></li>
              <li><Link to="/login" className="text-kalma-muted hover:text-kalma-gold text-sm transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-kalma-border mt-8 pt-8 text-center text-kalma-muted text-sm">
          &copy; {new Date().getFullYear()} KALMA MIXTAIL. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
