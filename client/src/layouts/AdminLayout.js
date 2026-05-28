import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const sidebarLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/drinks', label: 'Drinks' },
    { to: '/admin/customers', label: 'Customers' },
  ];

  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg transition-all ${
      isActive
        ? 'bg-kalma-gold/10 text-kalma-gold border-l-2 border-kalma-gold'
        : 'text-kalma-muted hover:text-white hover:bg-kalma-card'
    }`;

  return (
    <div className="min-h-screen bg-kalma-darker flex">
      <aside className="w-64 bg-kalma-dark border-r border-kalma-border fixed h-full hidden lg:block">
        <div className="p-6 border-b border-kalma-border">
          <Link to="/" className="font-display text-xl font-bold gold-gradient-text">KALMA</Link>
          <p className="text-kalma-muted text-xs mt-1">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-kalma-border">
          <p className="text-sm text-kalma-muted truncate">{user?.name}</p>
          <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 mt-1">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="bg-kalma-dark border-b border-kalma-border px-4 py-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                    isActive ? 'bg-kalma-gold text-kalma-dark' : 'bg-kalma-card text-kalma-muted'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
