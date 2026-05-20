import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800', DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders({ page, size: 15 });
      setOrders(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      // handled by interceptor
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatuses = (current) => {
    const transitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [], CANCELLED: [],
    };
    return transitions[current] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📋 Manage Orders</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : orders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                          <td className="px-4 py-3 font-mono text-xs font-medium text-gray-800 dark:text-gray-200">
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.username}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.orderItems?.length}</td>
                          <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                            ${order.totalAmount?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1">
                              {getNextStatuses(order.status).map(s => (
                                <button key={s} onClick={() => handleStatusChange(order.id, s)}
                                  disabled={updatingId === order.id}
                                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50
                                    ${s === 'CANCELLED'
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                    }`}>
                                  {updatingId === order.id ? '...' : s}
                                </button>
                              ))}
                              {getNextStatuses(order.status).length === 0 && (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Expanded order items */}
                        {expandedId === order.id && (
                          <tr>
                            <td colSpan={7} className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30">
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {order.orderItems?.map(item => (
                                  <div key={item.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 rounded-lg p-2">
                                    <span className="text-lg">📖</span>
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.bookTitle}</p>
                                      <p>Qty: {item.quantity} × ${item.unitPrice?.toFixed(2)} = ${item.subtotal?.toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                📍 {order.shippingAddress}
                                {order.paymentMethod && ` | 💳 ${order.paymentMethod}`}
                              </p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                }
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Page {page+1} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs disabled:opacity-40 dark:text-gray-200">← Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs disabled:opacity-40 dark:text-gray-200">Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
