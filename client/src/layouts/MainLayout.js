import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import useCustomerOrderAlerts from '../hooks/useCustomerOrderAlerts';
import CustomerOrderAlertBanner from '../components/CustomerOrderAlertBanner';
import { unlockOrderSound } from '../utils/orderSound';

const MainLayout = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const customerAlertsEnabled = isAuthenticated && !isAdmin;
  const { alert, dismissAlert } = useCustomerOrderAlerts(customerAlertsEnabled);

  useEffect(() => {
    if (!customerAlertsEnabled) return undefined;

    const unlockOnClick = () => {
      unlockOrderSound();
    };
    window.addEventListener('click', unlockOnClick, { once: true });
    return () => window.removeEventListener('click', unlockOnClick);
  }, [customerAlertsEnabled]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <CustomerOrderAlertBanner alert={alert} onDismiss={dismissAlert} />
    </div>
  );
};

export default MainLayout;
