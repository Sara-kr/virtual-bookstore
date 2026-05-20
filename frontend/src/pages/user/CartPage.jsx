import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, updateItem, removeItem, isLoading } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const handleQtyChange = async (itemId, qty) => {
    setUpdatingId(itemId);
    try {
      await updateItem(itemId, qty);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId, title) => {
    await removeItem(itemId);
    toast.success(`"${title}" removed from cart`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
      </div>
    );
  }

  const items = cart?.items || [];

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Discover amazing books and add them here</p>
          <Link to="/search" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full text-sm">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Shopping Cart <span className="text-gray-400 text-lg font-normal">({items.length} items)</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Cart Items ─────────────────────────────── */}
          <div className="flex-1 space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 shrink-0">
                  {item.bookImageUrl ? (
                    <img src={item.bookImageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">📖</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/books/${item.bookId}`}
                    className="font-semibold text-gray-900 dark:text-white text-sm hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2">
                    {item.bookTitle}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.bookAuthor}</p>
                  <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">${item.unitPrice?.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => handleRemove(item.id, item.bookTitle)}
                    className="text-gray-400 hover:text-red-500 text-sm transition-colors">✕</button>
                  <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full">
                    <button onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingId === item.id}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 dark:text-white rounded-l-full text-sm font-bold">
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium dark:text-white">
                      {updatingId === item.id ? (
                        <span className="inline-block w-3 h-3 border border-primary-600 border-t-transparent rounded-full animate-spin" />
                      ) : item.quantity}
                    </span>
                    <button onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.availableStock || updatingId === item.id}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 dark:text-white rounded-r-full text-sm font-bold">
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    ${item.subtotal?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ──────────────────────────── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cart?.totalItems} items)</span>
                  <span>${cart?.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700 my-2" />
                <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base">
                  <span>Total</span>
                  <span>${cart?.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-colors">
                Proceed to Checkout
              </button>
              <Link to="/search" className="block text-center text-primary-600 dark:text-primary-400 text-sm mt-3 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
