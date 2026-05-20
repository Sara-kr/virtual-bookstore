import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, bookService } from '../../services';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });

  useEffect(() => {
    adminService.getAnalytics()
      .then(r => setAnalytics(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Title and message required');
      return;
    }
    setBroadcasting(true);
    try {
      await adminService.broadcast(broadcastForm.title, broadcastForm.message);
      toast.success('Broadcast sent to all users!');
      setBroadcastForm({ title: '', message: '' });
    } finally {
      setBroadcasting(false);
    }
  };

  const statCards = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600', link: '/admin/users' },
    { label: 'Active Users', value: analytics.activeUsers, icon: '✅', color: 'from-green-500 to-green-600' },
    { label: 'Total Orders', value: analytics.totalOrders, icon: '📦', color: 'from-purple-500 to-purple-600', link: '/admin/orders' },
    { label: 'Revenue (30d)', value: `$${Number(analytics.revenueLastMonth || 0).toFixed(2)}`, icon: '💰', color: 'from-yellow-500 to-orange-500' },
    { label: 'Total Books', value: analytics.totalBooks, icon: '📚', color: 'from-indigo-500 to-indigo-600', link: '/admin/books' },
    { label: 'Pending Orders', value: analytics.ordersByStatus?.PENDING || 0, icon: '🕐', color: 'from-orange-400 to-orange-500', link: '/admin/orders' },
  ] : [];

  const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your bookstore platform</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/books/new"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
              + Add Book
            </Link>
            <Link to="/admin/orders"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-2xl animate-pulse shadow-sm border border-gray-100 dark:border-gray-700" />
              ))
            : statCards.map(stat => (
                <div key={stat.label}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 ${stat.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                  onClick={() => stat.link && (window.location.href = stat.link)}>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-2`}>
                    {stat.icon}
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))
          }
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Orders by Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Orders by Status</h2>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(analytics?.ordersByStatus || {}).map(([status, count]) => {
                  const total = Object.values(analytics.ordersByStatus).reduce((a, b) => a + Number(b), 0);
                  const pct = total ? Math.round((Number(count) / total) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
                          {status}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-2 bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Books by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Books by Category</h2>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(analytics?.booksByCategory || {}).slice(0, 6).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{cat}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white ml-2">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">⚠️ Low Stock Alert</h2>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded" />)}
              </div>
            ) : analytics?.lowStockAlert?.length === 0 ? (
              <p className="text-sm text-green-600 dark:text-green-400">✅ All books well-stocked</p>
            ) : (
              <div className="space-y-2">
                {analytics?.lowStockAlert?.map((book, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-red-500 text-xs">⚠️</span>
                    <span className="text-xs text-red-700 dark:text-red-400 line-clamp-1">{book}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/admin/books/new', icon: '➕', label: 'Add New Book', desc: 'Add to catalog', color: 'hover:border-blue-400' },
            { to: '/admin/orders', icon: '📋', label: 'Manage Orders', desc: 'View & update orders', color: 'hover:border-purple-400' },
            { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: 'View user accounts', color: 'hover:border-green-400' },
            { to: '/admin/books', icon: '📚', label: 'Manage Books', desc: 'Edit book catalog', color: 'hover:border-orange-400' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 border-transparent dark:border-gray-700 ${a.color} transition-all hover:shadow-md`}>
              <span className="text-3xl">{a.icon}</span>
              <p className="font-semibold text-gray-900 dark:text-white text-sm mt-2">{a.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{a.desc}</p>
            </Link>
          ))}
        </div>

        {/* Broadcast Notification */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">📢 Broadcast Notification</h2>
          <form onSubmit={handleBroadcast} className="flex flex-col sm:flex-row gap-3">
            <input
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              placeholder="Notification title..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
              placeholder="Message to all users..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button type="submit" disabled={broadcasting}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 whitespace-nowrap">
              {broadcasting ? 'Sending...' : 'Send Broadcast'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
