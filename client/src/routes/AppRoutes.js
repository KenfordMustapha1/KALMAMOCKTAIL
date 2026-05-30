import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import LandingPage from '../pages/LandingPage';
import MenuPage from '../pages/MenuPage';
import DrinkDetailPage from '../pages/DrinkDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminSetupPage from '../pages/admin/AdminSetupPage';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminDrinks from '../pages/admin/AdminDrinks';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminScanPage from '../pages/admin/AdminScanPage';
import { PreOrderRedeemPage, PreOrderSharePage } from '../pages/PreOrderPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/drinks/:id" element={<DrinkDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/preorder/:token" element={<PreOrderRedeemPage />} />
        <Route path="/preorder/:token/share" element={<PreOrderSharePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/setup" element={<AdminSetupPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="scan" element={<AdminScanPage />} />
        <Route path="scan/:token" element={<AdminScanPage />} />
        <Route path="drinks" element={<AdminDrinks />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
