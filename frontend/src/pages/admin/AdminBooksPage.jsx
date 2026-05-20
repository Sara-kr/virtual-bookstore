import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../../services';
import { useDebounce } from '../../hooks';
import toast from 'react-hot-toast';

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const debouncedSearch = useDebounce(search, 400);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = debouncedSearch
        ? await bookService.search({ q: debouncedSearch, page, size: 15 })
        : await bookService.getAll({ page, size: 15, sortBy: 'createdAt', direction: 'desc' });
      setBooks(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    setDeletingId(book.id);
    try {
      await bookService.delete(book.id);
      toast.success(`"${book.title}" deleted`);
      fetchBooks();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📚 Manage Books</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{totalElements} books total</p>
          </div>
          <Link to="/admin/books/new"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">
            + Add New Book
          </Link>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books by title or author..."
            className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Book</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                        <td className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                        <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10" /></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></td>
                        <td className="px-4 py-3"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" /></td>
                        <td className="px-4 py-3"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto" /></td>
                      </tr>
                    ))
                  : books.map(book => (
                      <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                              {book.imageUrl
                                ? <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{book.title}</p>
                              <p className="text-xs text-gray-400 truncate">{book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">{book.category}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">${book.price?.toFixed(2)}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`font-medium ${book.stock <= 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {book.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-yellow-500">
                          ★ {book.rating?.toFixed(1)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${book.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {book.isAvailable ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/books/${book.id}`} target="_blank"
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1" title="View">
                              👁
                            </Link>
                            <Link to={`/admin/books/edit/${book.id}`}
                              className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 p-1 text-xs font-medium">
                              Edit
                            </Link>
                            <button onClick={() => handleDelete(book)}
                              disabled={deletingId === book.id}
                              className="text-red-500 hover:text-red-700 disabled:opacity-40 p-1 text-xs font-medium">
                              {deletingId === book.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
