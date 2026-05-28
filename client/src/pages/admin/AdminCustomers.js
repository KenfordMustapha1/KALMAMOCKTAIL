import { useEffect, useState } from 'react';
import { getCustomers } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatters';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Customers</h1>

      {customers.length === 0 ? (
        <p className="text-kalma-muted">No customers registered yet.</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kalma-border text-kalma-muted text-left">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-b border-kalma-border/50 hover:bg-kalma-card/50">
                    <td className="p-4 text-white">{customer.name}</td>
                    <td className="p-4 text-kalma-muted">{customer.email}</td>
                    <td className="p-4 text-kalma-muted">{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
