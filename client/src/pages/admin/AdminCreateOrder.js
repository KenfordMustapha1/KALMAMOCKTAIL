import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDrinks } from '../../services/drinkService';
import { getCustomers } from '../../services/adminService';
import { adminCreateOrder } from '../../services/orderService';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminCreateOrder = () => {
  const navigate = useNavigate();
  const [drinks, setDrinks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [customerType, setCustomerType] = useState('walk_in');
  const [userId, setUserId] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [status, setStatus] = useState('Pending');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drinksData, customersData] = await Promise.all([
          getDrinks({ available: true }),
          getCustomers(),
        ]);
        setDrinks(drinksData);
        setCustomers(customersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateQuantity = (drinkId, value) => {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    setQuantities((prev) => ({ ...prev, [drinkId]: qty }));
  };

  const selectedItems = drinks
    .filter((d) => quantities[d._id] > 0)
    .map((d) => ({
      drink: d._id,
      name: d.name,
      price: d.price,
      quantity: quantities[d._id],
    }));

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedItems.length === 0) {
      setError('Add at least one drink to the order.');
      return;
    }

    if (customerType === 'registered' && !userId) {
      setError('Please select a customer.');
      return;
    }

    if (customerType === 'walk_in' && !walkInName.trim()) {
      setError('Please enter the customer name for walk-in orders.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: selectedItems.map(({ drink, quantity }) => ({ drink, quantity })),
        status,
      };

      if (customerType === 'registered') {
        payload.userId = userId;
      } else {
        payload.walkInName = walkInName.trim();
      }

      await adminCreateOrder(payload);
      navigate('/admin/orders', {
        state: { message: 'Manual order placed successfully!' },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Manual Order</h1>
          <p className="text-kalma-muted mt-2">
            Place an order for a customer at the counter (no app or internet needed).
          </p>
        </div>
        <Link to="/admin/orders" className="btn-secondary text-sm">
          Back to orders
        </Link>
      </div>

      {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Customer</h2>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-kalma-muted cursor-pointer">
              <input
                type="radio"
                name="customerType"
                checked={customerType === 'walk_in'}
                onChange={() => setCustomerType('walk_in')}
              />
              Walk-in (no account)
            </label>
            <label className="flex items-center gap-2 text-kalma-muted cursor-pointer">
              <input
                type="radio"
                name="customerType"
                checked={customerType === 'registered'}
                onChange={() => setCustomerType('registered')}
              />
              Registered customer
            </label>
          </div>

          {customerType === 'walk_in' ? (
            <input
              type="text"
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="Customer name (e.g. Juan)"
              className="input-field"
              required
            />
          ) : (
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white">Drinks</h2>
          {drinks.length === 0 ? (
            <p className="text-kalma-muted text-sm">No available drinks. Add drinks first.</p>
          ) : (
            <div className="space-y-3">
              {drinks.map((drink) => (
                <div
                  key={drink._id}
                  className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-kalma-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={drink.image}
                      alt={drink.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-white font-medium">{drink.name}</p>
                      <p className="text-kalma-muted text-sm">
                        {drink.category} · {formatPrice(drink.price)}
                      </p>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={quantities[drink._id] || ''}
                    onChange={(e) => updateQuantity(drink._id, e.target.value)}
                    placeholder="0"
                    className="input-field w-20 text-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-kalma-muted text-sm">Order total</p>
              <p className="text-2xl font-bold text-kalma-gold">{formatPrice(total)}</p>
            </div>
            <div>
              <label className="block text-sm text-kalma-muted mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || selectedItems.length === 0}
            className="btn-primary w-full flex justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <LoadingSpinner size="sm" /> : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateOrder;
