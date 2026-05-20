import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, reviewService } from '../../services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StarRating } from '../../components/book/BookCard';
import toast from 'react-hot-toast';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const [bookRes, reviewRes] = await Promise.all([
          bookService.getById(id),
          reviewService.getBookReviews(id, { page: 0, size: 10 }),
        ]);
        setBook(bookRes.data);
        setReviews(reviewRes.data?.content || []);
      } catch { navigate('/search'); }
      finally { setLoading(false); }
    };
    fetchBook();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    setAddingToCart(true);
    try {
      await addToCart(book.id, qty);
      toast.success(`${book.title} added to cart! 🛒`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await reviewService.addReview(id, myRating, myComment);
      toast.success('Review submitted!');
      const reviewRes = await reviewService.getBookReviews(id, { page: 0, size: 10 });
      setReviews(reviewRes.data?.content || []);
      setMyComment('');
      const bookRes = await bookService.getById(id);
      setBook(bookRes.data);
    } catch {
      // error via interceptor
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="w-full md:w-64 h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (!book) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Book Info ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-8 bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="w-full md:w-56 lg:w-64 shrink-0">
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 aspect-[3/4]">
              {book.imageUrl ? (
                <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">📖</div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full mb-3">
              {book.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">{book.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-3">by <span className="font-medium text-gray-700 dark:text-gray-300">{book.author}</span></p>

            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={book.rating} size="md" />
              <span className="text-sm text-gray-500 dark:text-gray-400">({book.reviewCount} reviews)</span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">{book.description}</p>

            {/* Meta info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-sm">
              {[
                { label: 'Publisher', value: book.publisher },
                { label: 'Pages', value: book.pageCount },
                { label: 'Language', value: book.language },
                { label: 'ISBN', value: book.isbn },
                { label: 'Published', value: book.publishedDate },
                { label: 'Stock', value: book.stock > 0 ? `${book.stock} available` : 'Out of stock' },
              ].filter(m => m.value).map(m => (
                <div key={m.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{m.label}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Price + Cart */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                ${book.price?.toFixed(2)}
              </span>
              {book.isAvailable && book.stock > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white text-sm font-bold">−</button>
                    <span className="px-3 text-sm font-medium dark:text-white">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(book.stock, q + 1))}
                      className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white text-sm font-bold">+</button>
                  </div>
                  <button onClick={handleAddToCart} disabled={addingToCart}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-full text-sm transition-colors">
                    {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                  </button>
                </div>
              )}
              {(!book.isAvailable || book.stock === 0) && (
                <span className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-sm">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews ───────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Reviews ({book.reviewCount || 0})
          </h2>

          {/* Write review */}
          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <h3 className="font-medium text-gray-800 dark:text-white mb-3">Write a Review</h3>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setMyRating(s)}
                    className={`text-2xl transition-transform hover:scale-125 ${s <= myRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-3"
              />
              <button type="submit" disabled={submittingReview}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:bg-primary-400">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 shrink-0">
                    {r.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{r.username}</span>
                      <StarRating rating={r.rating} size="sm" />
                      <span className="text-xs text-gray-400">{r.createdAt?.split('T')[0]}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
