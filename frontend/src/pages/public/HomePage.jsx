import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookService } from '../../services';
import { BookCard, SkeletonCard } from '../../components/book/BookCard';

export default function HomePage() {
  const [topBooks, setTopBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topRes, latestRes, catRes] = await Promise.all([
          bookService.getTopRated(8),
          bookService.getLatest(),
          bookService.getCategories(),
        ]);
        setTopBooks(topRes.data || []);
        setLatestBooks(latestRes.data || []);
        setCategories(catRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const categoryIcons = {
    'Programming': '💻', 'Fiction': '📖', 'Science Fiction': '🚀',
    'Self-Help': '🌱', 'History': '🏛️', 'Computer Science': '🖥️',
    'Business': '💼', 'Biography': '👤', 'Science': '🔬', 'Art': '🎨'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              Your Next Great<br />
              <span className="text-yellow-300">Read Awaits</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8">
              Discover thousands of books across every genre. From bestsellers to hidden gems — all in one place.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or category..."
                className="flex-1 px-5 py-3 rounded-full text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
              />
              <button type="submit"
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-full text-sm transition-colors">
                Search
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-5">
              {['Programming', 'Fiction', 'Self-Help', 'Science Fiction'].map(cat => (
                <Link key={cat} to={`/search?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* Decorative books */}
        <div className="absolute right-8 bottom-0 hidden lg:flex gap-3 text-7xl opacity-30 pb-4">
          {['📚', '📖', '📕', '📗'].map((e, i) => (
            <span key={i} className="animate-pulse-slow" style={{ animationDelay: `${i * 0.5}s` }}>{e}</span>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Browse Categories</h2>
        <div className="flex flex-wrap gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              ))
            : categories.map(cat => (
                <Link key={cat} to={`/search?category=${encodeURIComponent(cat)}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm hover:shadow">
                  <span>{categoryIcons[cat] || '📚'}</span>
                  {cat}
                </Link>
              ))
          }
        </div>
      </section>

      {/* ── Top Rated Books ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">⭐ Top Rated</h2>
          <Link to="/search?sort=rating" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : topBooks.map(book => <BookCard key={book.id} book={book} />)
          }
        </div>
      </section>

      {/* ── Latest Arrivals ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🆕 New Arrivals</h2>
          <Link to="/search?sort=createdAt&direction=desc" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : latestBooks.slice(0, 4).map(book => <BookCard key={book.id} book={book} />)
          }
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-indigo-600 to-primary-600 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-3">Start Your Reading Journey Today</h2>
          <p className="text-primary-100 mb-6">Join thousands of readers discovering great books every day.</p>
          <Link to="/register"
            className="inline-block px-8 py-3 bg-white text-primary-700 font-bold rounded-full hover:bg-primary-50 transition-colors text-sm">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
