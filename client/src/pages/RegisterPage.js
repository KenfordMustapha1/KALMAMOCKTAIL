import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    registrationCode: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-uppercase registration code
    const newValue = name === 'registrationCode' ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!/^[A-Z]{2}\d{2}$/.test(formData.registrationCode)) {
      setError('Registration code must be 2 letters + 2 numbers (e.g., AB12)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({
        name: formData.name,
        registrationCode: formData.registrationCode,
        password: formData.password,
      });
      navigate('/menu');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold gold-gradient-text">Join KALMA</h1>
          <p className="text-kalma-muted mt-1 sm:mt-2 text-sm sm:text-base">Create your account and start ordering</p>
        </div>

        <div className="card p-4 sm:p-8">
          {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm text-kalma-muted mb-2">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-kalma-muted mb-2">Registration Code</label>
              <input 
                type="text" 
                name="registrationCode" 
                value={formData.registrationCode} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="e.g., AB12"
                maxLength={4}
                required 
              />
              <p className="text-xs text-kalma-muted mt-1">Format: 2 letters + 2 numbers</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-kalma-muted mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" minLength={6} required />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-kalma-muted mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base">
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-kalma-muted text-xs sm:text-sm mt-4 sm:mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-kalma-gold hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
