import api from './api';

// ─── Auth Services ───────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (token) => api.post(`/auth/refresh?refreshToken=${token}`),
};

// ─── Book Services ────────────────────────────────────────────────
export const bookService = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (params) => api.get('/books/search', { params }),
  getTopRated: (limit = 10) => api.get('/books/top-rated', { params: { limit } }),
  getLatest: () => api.get('/books/latest'),
  getCategories: () => api.get('/books/categories'),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

// ─── Cart Services ────────────────────────────────────────────────
export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}?quantity=${quantity}`),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// ─── Order Services ───────────────────────────────────────────────
export const orderService = {
  placeOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.delete(`/orders/${id}/cancel`),
  // Admin
  getAllOrders: (params) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status?status=${status}`),
};

// ─── Notification Services ────────────────────────────────────────
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// ─── User Services ────────────────────────────────────────────────
export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
};

// ─── Admin Services ───────────────────────────────────────────────
export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  broadcast: (title, message) => api.post(`/admin/broadcast?title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}`),
  getLowStock: (threshold) => api.get('/admin/low-stock', { params: { threshold } }),
};

// ─── Review Services ──────────────────────────────────────────────
export const reviewService = {
  getBookReviews: (bookId, params) => api.get(`/reviews/book/${bookId}`, { params }),
  addReview: (bookId, rating, comment) =>
    api.post(`/reviews/book/${bookId}?rating=${rating}${comment ? '&comment=' + encodeURIComponent(comment) : ''}`),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};
