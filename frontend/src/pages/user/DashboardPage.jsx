import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderService, notificationService } from '../../services';
import { useCart } from '../../context/CartContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { cart } = useCart();
  const [recentOrders, setRecentOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, notifRes] = await Promise.all([
          orderService.getMyOrders({ page: 0, size: 3 }),
          notificationService.getUnreadCount(),
        ]);
        setRecentOrders(ordersRes.data?.content || []);
        setUnreadCount(notifRes.data?.unreadCount || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const STATUS_COLORS = {
    PENDING: 'text-yellow-600', CONFIRMED: 'text-blue-600',
    SHIPPED: 'text-purple-600', DELIVERED: 'text-green-600', CANCELLED: 'text-red-600',
  };

  const stats = [
    { label: 'Total Orders', value: recentOrders.length ? '—' : '0', icon: '📦', link: '/orders', color: 'from-blue-500 to-blue-600' },
    { label: 'Cart Items', value: cart?.totalItems || 0, icon: '🛒', link: '/cart', color: 'from-orange-400 to-orange-500' },
    { label: 'Notifications', value: unreadCount, icon: '🔔', link: '/notifications', color: 'from-purple-500 to-purple-600' },
    { label: 'Wishlist', value: '—', icon: '❤️', link: '/search', color: 'from-pink-400 to-pink-500' },
  ];

  const quickLinks = [
    { to: '/search', icon: '🔍', label: 'Browse Books', desc: 'Discover new titles' },
    { to: '/cart', icon: '🛒', label: 'My Cart', desc: `${cart?.totalItems || 0} items` },
    { to: '/orders', icon: '📦', label: 'My Orders', desc: 'Track your orders' },
    { to: '/notifications', icon: '🔔', label: 'Notifications', desc: `${unreadCount} unread` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {user?.firstName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
              <p className="text-primary-100 text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <Link key={stat.label} to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? <span className="inline-block w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                <Link to="/orders" className="text-primary-600 dark:text-primary-400 text-sm hover:underline">View All</Link>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-sm">No orders yet</p>
                    <Link to="/search" className="text-primary-600 dark:text-primary-400 text-xs mt-1 hover:underline block">
                      Start shopping →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map(order => (
                      <Link key={order.id} to={`/orders/${order.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <div>
                          <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-gray-900 dark:text-white">${order.totalAmount?.toFixed(2)}</p>
                          <p className={`text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-5 space-y-2">
                {quickLinks.map(link => (
                  <Link key={link.to} to={link.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                    <span className="text-xl">{link.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {link.label}
                      </p>
                      <p className="text-xs text-gray-400">{link.desc}</p>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600 group-hover:text-primary-400 text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Account</h2>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Name</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{user?.firstName} {user?.lastName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Email</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate ml-2">{user?.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Role</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {user?.roles?.includes('ROLE_ADMIN') ? 'Admin' : 'Customer'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
