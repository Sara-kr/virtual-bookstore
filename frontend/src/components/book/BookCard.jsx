import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Star Rating ──────────────────────────────────────────────────
export function StarRating({ rating = 0, max = 5, size = 'sm' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  return (
    <span className={`${sizes[size]} text-yellow-400`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < Math.floor(rating) ? '★' : i < rating ? '⯨' : '☆'}</span>
      ))}
    </span>
  );
}

// ─── Book Card ────────────────────────────────────────────────────
export function BookCard({ book }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart(book.id, 1);
      toast.success(`"${book.title}" added to cart! 🛒`);
    } catch {
      // error handled by interceptor
    }
  };

  return (
    <Link to={`/books/${book.id}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">

      {/* Cover image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 h-56">
        {book.imageUrl ? (
          <img src={book.imageUrl} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">📖</div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-400 text-xs font-semibold px-2 py-1 rounded-full shadow">
            {book.category}
          </span>
        </div>
        {book.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">by {book.author}</p>

        <div className="flex items-center gap-1 mt-auto">
          <StarRating rating={book.rating} />
          <span className="text-xs text-gray-400">({book.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-primary-700 dark:text-primary-400 font-bold text-lg">
            ${book.price?.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={book.stock === 0}
            className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600
                       text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
            {book.stock === 0 ? 'Sold Out' : '+ Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-56 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Books Grid ───────────────────────────────────────────────────
export function BooksGrid({ books, loading, skeletonCount = 8 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (!books?.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-medium">No books found</p>
        <p className="text-sm mt-1">Try different search terms or filters</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {books.map(book => <BookCard key={book.id} book={book} />)}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
        ← Prev
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
            ${p === page
              ? 'bg-primary-600 text-white'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200'
            }`}>
          {p + 1}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200">
        Next →
      </button>
    </div>
  );
}
