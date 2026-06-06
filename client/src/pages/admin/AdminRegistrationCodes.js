import { useState, useEffect } from 'react';
import { Check, Copy, KeyRound, Sparkles, Ticket } from 'lucide-react';
import { generateRegistrationCodes, getRegistrationCodes } from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminRegistrationCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchCodes = async (status = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRegistrationCodes(status);
      setCodes(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes(filterStatus);
  }, [filterStatus]);

  const handleGenerateCodes = async (e) => {
    e.preventDefault();
    if (quantity < 1 || quantity > 100) {
      setError('Quantity must be between 1 and 100');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateRegistrationCodes(quantity);
      setSuccess(`Successfully generated ${quantity} registration code(s)`);
      setQuantity(1);
      // Refetch codes
      fetchCodes(filterStatus);
    } catch (err) {
      setError(err.message || 'Failed to generate codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const unusedCount = codes.filter(c => !c.used).length;
  const usedCount = codes.filter(c => c.used).length;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">
        Registration Codes
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 text-kalma-muted text-xs sm:text-sm">
            <KeyRound className="w-4 h-4" strokeWidth={1.75} />
            Total Codes
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-2">{codes.length}</p>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 text-kalma-muted text-xs sm:text-sm">
            <Ticket className="w-4 h-4 text-green-400" strokeWidth={1.75} />
            Unused
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-400 mt-2">{unusedCount}</p>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2 text-kalma-muted text-xs sm:text-sm">
            <Check className="w-4 h-4 text-yellow-400" strokeWidth={1.75} />
            Used
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2">{usedCount}</p>
        </div>
      </div>

      {/* Generate Form */}
      <div className="card p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Generate New Codes</h2>
        {error && <ErrorMessage message={error} className="mb-4" />}
        {success && (
          <div className="bg-green-900/30 border border-green-500/50 rounded p-3 mb-4 text-green-400 text-sm">
            {success}
          </div>
        )}
        <form onSubmit={handleGenerateCodes} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm text-kalma-muted mb-2">
              Number of Codes (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="input-field w-full"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2.5 sm:py-3 h-fit mt-6 sm:mt-0"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                Generate
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Filter and List */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Codes List</h2>

        <div className="flex gap-2 mb-4">
          {['all', 'unused', 'used'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-kalma-gold text-black'
                  : 'bg-kalma-border text-kalma-muted hover:bg-kalma-border/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" size="lg" />
        ) : codes.length === 0 ? (
          <p className="text-kalma-muted text-sm py-8">No registration codes found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-kalma-border">
                  <th className="text-left py-3 px-2 text-kalma-muted font-semibold">Code</th>
                  <th className="text-left py-3 px-2 text-kalma-muted font-semibold">Status</th>
                  <th className="text-left py-3 px-2 text-kalma-muted font-semibold">Used By</th>
                  <th className="text-left py-3 px-2 text-kalma-muted font-semibold">Created</th>
                  <th className="text-left py-3 px-2 text-kalma-muted font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code._id} className="border-b border-kalma-border/50 hover:bg-kalma-border/20">
                    <td className="py-3 px-2">
                      <span className="font-mono text-kalma-gold font-bold">{code.code}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          code.used
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-green-900/30 text-green-400'
                        }`}
                      >
                        {code.used ? 'Used' : 'Unused'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-kalma-muted">
                      {code.usedBy?.name || '-'}
                    </td>
                    <td className="py-3 px-2 text-kalma-muted">
                      {new Date(code.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleCopyCode(code.code)}
                        className={`text-xs px-2 py-1 rounded transition flex items-center gap-1 ${
                          copiedCode === code.code
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-kalma-border text-kalma-gold hover:bg-kalma-border/80'
                        }`}
                      >
                        {copiedCode === code.code ? (
                          <>
                            <Check className="w-3 h-3" strokeWidth={2} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" strokeWidth={1.75} />
                            Copy
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrationCodes;
