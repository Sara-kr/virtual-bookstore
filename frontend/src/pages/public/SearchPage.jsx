import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookService } from '../../services';
import { BooksGrid, Pagination } from '../../components/book/BookCard';
import { useDebounce } from '../../hooks';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Filter state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [direction, setDirection] = useState(searchParams.get('direction') || 'desc');
  const [page, setPage] = useState(0);

  const debouncedQuery = useDebounce(query, 400);

  // Load categories
  useEffect(() => {
    bookService.getCategories().then(r => setCategories(r.data || []));
  }, []);

  // Fetch books when filters change
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        q: debouncedQuery || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        page, size: 12, sortBy, direction,
      };
      const res = await bookService.search(params);
      setBooks(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, category, minPrice, maxPrice, page, sortBy, direction]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { setPage(0); }, [debouncedQuery, category, minPrice, maxPrice, sortBy]);

  const clearFilters = () => {
    setQuery(''); setCategory(''); setMinPrice(''); setMaxPrice('');
    setSortBy('createdAt'); setDirection('desc'); setPage(0);
    setSearchParams({});
  };

  const hasFilters = query || category || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {query ? `Results for "${query}"` : 'Browse Books'}
          </h1>
          {!loading && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{totalElements} books found</p>}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar Filters ─────────────────────────── */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Search</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Title, author..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Price range */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min" min="0"
                    className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max" min="0"
                    className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Sort By</label>
                <select value={`${sortBy}_${direction}`} onChange={(e) => {
                  const [s, d] = e.target.value.split('_');
                  setSortBy(s); setDirection(d);
                }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating_desc">Top Rated</option>
                  <option value="title_asc">Title A–Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* ── Results ──────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            <BooksGrid books={books} loading={loading} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </main>
        </div>
      </div>
    </div>
  );
}
