import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getAdminSetupStatus, setupAdmin } from '../../services/authService';

const AdminSetupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [checking, setChecking] = useState(true);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const status = await getAdminSetupStatus();
        setSetupAvailable(!status.adminExists);
      } catch (err) {
        setError(err.message);
      } finally {
        setChecking(false);
      }
    };
    checkAvailability();
  }, []);

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await setupAdmin(formData);
      await login({ email: formData.email, password: formData.password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-kalma-dark">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold gold-gradient-text">Admin Setup</h1>
          <p className="text-kalma-muted mt-2">Create the first admin account</p>
        </div>

        <div className="card p-8">
          {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

          {!setupAvailable ? (
            <div className="space-y-4">
              <p className="text-kalma-muted text-sm">
                Admin setup has already been completed and is now locked.
              </p>
              <Link to="/admin/login" className="btn-primary w-full text-center block">
                Go to Admin Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-kalma-muted mb-2">Admin Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
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
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : 'Create Admin Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;
