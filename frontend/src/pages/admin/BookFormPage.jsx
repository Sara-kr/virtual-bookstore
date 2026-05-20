import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookService } from '../../services';
import toast from 'react-hot-toast';

export default function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: '', author: '', category: '', price: '',
    stock: '', description: '', imageUrl: '', isbn: '',
    publisher: '', pageCount: '', language: 'English', publishedDate: '',
  });

  useEffect(() => {
    if (isEdit) {
      bookService.getById(id).then(res => {
        const b = res.data;
        setForm({
          title: b.title || '', author: b.author || '', category: b.category || '',
          price: b.price || '', stock: b.stock || '', description: b.description || '',
          imageUrl: b.imageUrl || '', isbn: b.isbn || '', publisher: b.publisher || '',
          pageCount: b.pageCount || '', language: b.language || 'English',
          publishedDate: b.publishedDate || '',
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.author.trim()) e.author = 'Author required';
    if (!form.category.trim()) e.category = 'Category required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price required';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Valid stock required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        pageCount: form.pageCount ? parseInt(form.pageCount) : undefined,
      };
      if (isEdit) {
        await bookService.update(id, payload);
        toast.success('Book updated!');
      } else {
        await bookService.create(payload);
        toast.success('Book added to catalog!');
      }
      navigate('/admin/books');
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, required, half, textarea }) => (
    <div className={half ? '' : 'col-span-2'}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-4 py-3 rounded-xl border ${errors[name] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
            bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none`}
        />
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border ${errors[name] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
            bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}
        />
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
      </div>
    );
  }

  const CATEGORIES = ['Programming', 'Fiction', 'Science Fiction', 'Self-Help', 'History', 'Computer Science', 'Business', 'Biography', 'Science', 'Art', 'Mathematics', 'Philosophy'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin/books')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">←</button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? '✏️ Edit Book' : '➕ Add New Book'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-5">
              <Field name="title" label="Book Title" placeholder="e.g. Clean Code" required />
              <Field name="author" label="Author" placeholder="e.g. Robert C. Martin" required half />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.category ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <Field name="price" label="Price ($)" type="number" placeholder="0.00" required half />
              <Field name="stock" label="Stock" type="number" placeholder="0" required half />
              <Field name="isbn" label="ISBN" placeholder="978-0-000-00000-0" half />
              <Field name="publisher" label="Publisher" placeholder="Publisher name" half />
              <Field name="pageCount" label="Page Count" type="number" placeholder="0" half />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['English', 'Spanish', 'French', 'German', 'Hindi', 'Tamil', 'Japanese', 'Chinese'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <Field name="publishedDate" label="Published Date" type="date" half />
              <Field name="imageUrl" label="Cover Image URL" placeholder="https://..." />
              <Field name="description" label="Description" placeholder="Book description..." textarea />
            </div>
          </div>

          {/* Preview */}
          {form.imageUrl && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Preview</p>
              <img src={form.imageUrl} alt="Cover preview"
                className="h-40 object-cover rounded-lg"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl text-sm transition-colors">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEdit ? 'Updating...' : 'Adding...'}
                </span>
              ) : isEdit ? 'Update Book' : 'Add Book'}
            </button>
            <button type="button" onClick={() => navigate('/admin/books')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
