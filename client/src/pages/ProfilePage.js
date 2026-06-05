import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await updateProfile(updateData);
      setSuccess(true);
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-8 sm:py-12 animate-fade-in pb-24">
      <h1 className="section-title mb-6 sm:mb-8 text-2xl sm:text-4xl">My Profile</h1>

      <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
        <p className="text-kalma-muted text-xs sm:text-sm">Account Type</p>
        <p className="text-kalma-gold font-medium capitalize text-sm sm:text-base mt-1">{user?.role}</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-green-400 text-sm sm:text-base">
          Profile updated successfully!
        </div>
      )}

      {error && <div className="mb-4 sm:mb-6"><ErrorMessage message={error} /></div>}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm text-kalma-muted mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm text-kalma-muted mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm text-kalma-muted mb-2">New Password (optional)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field text-sm"
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm text-kalma-muted mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field text-sm"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center gap-2 py-3 sm:py-3 text-sm sm:text-base">
          {loading ? <LoadingSpinner size="sm" /> : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
