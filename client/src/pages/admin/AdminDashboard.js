import { useEffect, useState } from 'react';
import {
  Banknote,
  CircleCheck,
  Clock,
  ChefHat,
  Package,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';
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
    { label: 'Total Orders', value: analytics.totalOrders, icon: Package, color: 'text-blue-400' },
    { label: 'Completed Orders', value: analytics.completedOrders, icon: CircleCheck, color: 'text-green-400' },
    { label: 'Total Sales', value: formatPrice(analytics.totalSales), icon: Banknote, color: 'text-kalma-gold' },
    { label: 'Revenue', value: formatPrice(analytics.revenue), icon: TrendingUp, color: 'text-emerald-400' },
  ];

  const statusCounts = [
    { label: 'Pending', value: analytics.pendingOrders, color: 'text-yellow-400', icon: Clock },
    { label: 'Preparing', value: analytics.preparingOrders, color: 'text-blue-400', icon: ChefHat },
    { label: 'Ready', value: analytics.readyOrders, color: 'text-purple-400', icon: PackageCheck },
  ];

  return (
    <div className="animate-fade-in px-0">
      <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 px-3 sm:px-0">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-kalma-muted text-xs sm:text-sm">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-white mb-4 text-base sm:text-lg">Order Status Overview</h2>
          <div className="space-y-3">
            {statusCounts.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex justify-between items-center">
                  <span className={`${item.color} text-sm sm:text-base flex items-center gap-2`}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    {item.label}
                  </span>
                  <span className="font-bold text-white text-sm sm:text-base">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <h2 className="font-semibold text-white mb-4 text-base sm:text-lg">Recent Orders</h2>
          {analytics.recentOrders?.length === 0 ? (
            <p className="text-kalma-muted text-xs sm:text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.recentOrders?.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center text-xs sm:text-sm border-b border-kalma-border pb-2 last:border-0"
                >
                  <div>
                    <p className="text-white">{order.user?.name || order.walkInName || 'Walk-in'}</p>
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
