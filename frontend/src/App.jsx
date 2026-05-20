import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './routes/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useWebSocket } from './websocket/useWebSocket';

// Lazy-loaded pages
const HomePage       = lazy(() => import('./pages/public/HomePage'));
const LoginPage      = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/public/RegisterPage'));
const SearchPage     = lazy(() => import('./pages/public/SearchPage'));
const BookDetailPage = lazy(() => import('./pages/public/BookDetailPage'));

const DashboardPage      = lazy(() => import('./pages/user/DashboardPage'));
const CartPage           = lazy(() => import('./pages/user/CartPage'));
const CheckoutPage       = lazy(() => import('./pages/user/CheckoutPage'));
const OrderHistoryPage   = lazy(() => import('./pages/user/OrderHistoryPage'));
const OrderDetailPage    = lazy(() => import('./pages/user/OrderDetailPage'));
const NotificationsPage  = lazy(() => import('./pages/user/NotificationsPage'));

const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBooksPage  = lazy(() => import('./pages/admin/AdminBooksPage'));
const BookFormPage    = lazy(() => import('./pages/admin/BookFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminUsersPage  = lazy(() => import('./pages/admin/AdminUsersPage'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Inner component that can use AuthContext
function AppContent() {
  useWebSocket(); // Connect WebSocket when authenticated

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navbar />
      <main className="flex-1">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ─────────────────────────────── */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/search"      element={<SearchPage />} />
          <Route path="/books/:id"   element={<BookDetailPage />} />

          {/* ── Guest-only ─────────────────────────── */}
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* ── Protected User ─────────────────────── */}
          <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/cart"          element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout"      element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"        element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/orders/:id"    element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* ── Admin ──────────────────────────────── */}
          <Route path="/admin"              element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/books"        element={<AdminRoute><AdminBooksPage /></AdminRoute>} />
          <Route path="/admin/books/new"    element={<AdminRoute><BookFormPage /></AdminRoute>} />
          <Route path="/admin/books/edit/:id" element={<AdminRoute><BookFormPage /></AdminRoute>} />
          <Route path="/admin/orders"       element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
          <Route path="/admin/users"        element={<AdminRoute><AdminUsersPage /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #1f2937)',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
