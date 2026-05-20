import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED:   'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_ICONS = {
  PENDING: '🕐', CONFIRMED: '✅', SHIPPED: '🚚', DELIVERED: '📦', CANCELLED: '❌',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async (p = 0) => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders({ page: p, size: 10 });
      setOrders(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const handleCancel = async (orderId, orderNumber) => {
    if (!window.confirm(`Cancel order ${orderNumber}?`)) return;
    setCancellingId(orderId);
    try {
      await orderService.cancel(orderId);
      toast.success('Order cancelled');
      fetchOrders(page);
    } catch {
      // handled by interceptor
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start exploring and place your first order!</p>
            <Link to="/search" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full text-sm">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                        {STATUS_ICONS[order.status]} {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary-600 dark:text-primary-400">${order.totalAmount?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{order.orderItems?.length} item(s)</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {order.orderItems?.slice(0, 4).map(item => (
                    <div key={item.id} className="shrink-0 w-12 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {item.bookImageUrl
                        ? <img src={item.bookImageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">📖</div>
                      }
                    </div>
                  ))}
                  {order.orderItems?.length > 4 && (
                    <div className="shrink-0 w-12 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                      +{order.orderItems.length - 4}
                    </div>
                  )}
                </div>

                {/* Progress tracker */}
                <div className="mb-4">
                  <div className="flex items-center gap-0">
                    {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((s, i, arr) => {
                      const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                      const currentIdx = statuses.indexOf(order.status);
                      const isCompleted = statuses.indexOf(s) <= currentIdx && order.status !== 'CANCELLED';
                      return (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                              ${isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                              {isCompleted ? '✓' : i + 1}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 hidden sm:block">{s.toLowerCase()}</p>
                          </div>
                          {i < arr.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${isCompleted && statuses.indexOf(arr[i+1]) <= currentIdx ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link to={`/orders/${order.id}`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium rounded-lg transition-colors">
                    View Details
                  </Link>
                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancel(order.id, order.orderNumber)}
                      disabled={cancellingId === order.id}
                      className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
                      {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40 dark:text-gray-200">
                  ← Prev
                </button>
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  {page + 1} / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40 dark:text-gray-200">
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
