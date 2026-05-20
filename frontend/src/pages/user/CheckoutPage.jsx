import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: '',
    paymentMethod: 'CREDIT_CARD',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const items = cart?.items || [];

  const validate = () => {
    const e = {};
    if (!form.shippingAddress.trim()) e.shippingAddress = 'Shipping address is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await orderService.placeOrder(form);
      await fetchCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.data.id}`);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Left: Shipping + Payment ─────────────── */}
            <div className="flex-1 space-y-5">

              {/* Shipping */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">📦 Shipping Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Shipping Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    rows={3}
                    placeholder="123 Main Street, City, State, ZIP, Country"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.shippingAddress ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                      bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none`}
                  />
                  {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">💳 Payment Method</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'CREDIT_CARD', label: '💳 Credit Card' },
                    { value: 'DEBIT_CARD', label: '💰 Debit Card' },
                    { value: 'PAYPAL', label: '🅿️ PayPal' },
                    { value: 'UPI', label: '📱 UPI' },
                    { value: 'NET_BANKING', label: '🏦 Net Banking' },
                    { value: 'COD', label: '💵 Cash on Delivery' },
                  ].map(pm => (
                    <label key={pm.value}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm
                        ${form.paymentMethod === pm.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 text-gray-700 dark:text-gray-300'
                        }`}>
                      <input type="radio" name="payment" value={pm.value}
                        checked={form.paymentMethod === pm.value}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                        className="hidden"
                      />
                      {pm.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">📝 Order Notes (Optional)</h2>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Any special instructions for your order..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            {/* ── Right: Order Summary ──────────────────── */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                        {item.bookImageUrl
                          ? <img src={item.bookImageUrl} alt={item.bookTitle} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl">📖</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{item.bookTitle}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 shrink-0">
                        ${item.subtotal?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-200 dark:border-gray-700 mb-4" />

                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>${cart?.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>Included</span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base">
                    <span>Total</span>
                    <span>${cart?.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold rounded-xl text-sm transition-colors">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : `Place Order • $${cart?.totalPrice?.toFixed(2)}`}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  🔒 Secure checkout — your data is protected
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
