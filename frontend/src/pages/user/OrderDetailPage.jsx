import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../services';
import { getStatusColor, getStatusIcon, formatDate } from '../../utils/helpers';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { navigate('/orders'); return; }
    orderService.getById(id)
      .then(r => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  );
  if (!order) return null;

  const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentIdx = statuses.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg">←</Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</h1>
            <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)} {order.status}
          </span>
        </div>

        {/* Progress */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-5">
            <div className="flex items-center gap-0">
              {statuses.map((s, i, arr) => {
                const done = i <= currentIdx;
                return (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${done ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 hidden sm:block capitalize">{s.toLowerCase()}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.orderItems?.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 shrink-0 flex items-center justify-center text-2xl">
                  {item.bookImageUrl ? <img src={item.bookImageUrl} alt={item.bookTitle} className="w-full h-full object-cover" /> : '📖'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{item.bookTitle}</p>
                  <p className="text-xs text-gray-400">{item.bookAuthor}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ${item.unitPrice?.toFixed(2)}</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white shrink-0">${item.subtotal?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Method</span><span className="font-medium dark:text-white">{order.paymentMethod || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Status</span><span className="font-medium dark:text-white">{order.paymentStatus || '—'}</span></div>
              <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Shipping</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{order.shippingAddress}</p>
            {order.notes && <p className="text-xs text-gray-400 mt-2">Note: {order.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
