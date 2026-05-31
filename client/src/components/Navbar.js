import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold gold-gradient-text">KALMA</span>
            <span className="text-kalma-muted text-sm hidden sm:inline">MIXTAIL</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-kalma-muted hover:text-kalma-gold transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-kalma-gold text-kalma-dark text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="btn-secondary text-sm py-2 px-4">
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
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-kalma-muted"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-kalma-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </NavLink>
              ))}
              <Link to="/cart" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Cart ({cartCount})
              </Link>
              {isAuthenticated ? (
                <>
                  {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="text-left text-red-400">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
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
