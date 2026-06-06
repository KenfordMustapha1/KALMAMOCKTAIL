import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-kalma-gold' : 'text-kalma-muted hover:text-white'}`;

  const links = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-kalma-dark/90 backdrop-blur-md border-b border-kalma-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg sm:text-xl font-bold gold-gradient-text">KALMA</span>
            <span className="text-kalma-muted text-xs sm:text-sm hidden sm:inline">MIXTAIL</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link to="/cart" className="relative p-2 text-kalma-muted hover:text-kalma-gold transition-colors">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-kalma-gold text-kalma-dark text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">
                    Admin
                  </Link>
                )}
                <Link to="/orders" className={navLinkClass}>
                  Orders
                </Link>
                <Link to="/profile" className={navLinkClass}>{user?.name?.split(' ')[0]}</Link>
                <button onClick={handleLogout} className="text-kalma-muted hover:text-red-400 text-sm transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>Login</Link>
                <Link to="/register" className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">Sign Up</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-kalma-muted"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" strokeWidth={1.75} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-kalma-border animate-fade-in">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className="text-xs sm:text-sm pl-2" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </NavLink>
              ))}
              <Link to="/cart" className="text-xs sm:text-sm pl-2" onClick={() => setMenuOpen(false)}>
                Cart ({cartCount})
              </Link>
              {isAuthenticated ? (
                <>
                  {isAdmin && <Link to="/admin" className="text-xs sm:text-sm pl-2" onClick={() => setMenuOpen(false)}>Admin</Link>}
                  <Link to="/orders" className="text-xs sm:text-sm pl-2" onClick={() => setMenuOpen(false)}>Orders</Link>
                  <Link to="/profile" className="text-xs sm:text-sm pl-2" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="text-left text-red-400 text-xs sm:text-sm pl-2">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs sm:text-sm pl-2" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="text-xs sm:text-sm pl-2" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
