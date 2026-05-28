import { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;
  if (error) return <ErrorMessage message={error} />;

  const stats = [
    { label: 'Total Orders', value: analytics.totalOrders, icon: '📦' },
    { label: 'Completed Orders', value: analytics.completedOrders, icon: '✅' },
    { label: 'Total Sales', value: formatPrice(analytics.totalSales), icon: '💰' },
    { label: 'Revenue', value: formatPrice(analytics.revenue), icon: '📈' },
  ];

  const statusCounts = [
    { label: 'Pending', value: analytics.pendingOrders, color: 'text-yellow-400' },
    { label: 'Preparing', value: analytics.preparingOrders, color: 'text-blue-400' },
    { label: 'Ready', value: analytics.readyOrders, color: 'text-purple-400' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-kalma-muted text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Order Status Overview</h2>
          <div className="space-y-3">
            {statusCounts.map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className={`${item.color}`}>{item.label}</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Recent Orders</h2>
          {analytics.recentOrders?.length === 0 ? (
            <p className="text-kalma-muted text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentOrders?.map((order) => (
                <div key={order._id} className="flex justify-between items-center text-sm border-b border-kalma-border pb-2 last:border-0">
                  <div>
                    <p className="text-white">{order.user?.name}</p>
                    <p className="text-kalma-muted text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-kalma-gold mt-1">{formatPrice(order.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
