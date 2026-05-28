import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  if (isAuthenticated && isAdmin) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(formData);
      if (user.role !== 'admin') {
        logout();
        setError('This page is for admin accounts only.');
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-kalma-dark">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold gold-gradient-text">Admin Login</h1>
          <p className="text-kalma-muted mt-2">Sign in to manage KALMA dashboard</p>
        </div>

        <div className="card p-8">
          {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-kalma-muted mb-2">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-kalma-muted mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In as Admin'}
            </button>
          </form>

          <p className="text-center text-kalma-muted text-sm mt-6">
            Not an admin?{' '}
            <Link to="/login" className="text-kalma-gold hover:underline">Go to user login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
