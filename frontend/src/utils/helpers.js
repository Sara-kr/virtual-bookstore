export const formatPrice = (price) => {
  if (price === null || price === undefined) return '$0.00';
  return `$${Number(price).toFixed(2)}`;
};
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};
export const getStatusColor = (status) => {
  const map = { PENDING:'bg-yellow-100 text-yellow-800', CONFIRMED:'bg-blue-100 text-blue-800', SHIPPED:'bg-purple-100 text-purple-800', DELIVERED:'bg-green-100 text-green-800', CANCELLED:'bg-red-100 text-red-800' };
  return map[status] || 'bg-gray-100 text-gray-800';
};
export const getStatusIcon = (status) => {
  const map = { PENDING:'🕐', CONFIRMED:'✅', SHIPPED:'🚚', DELIVERED:'📦', CANCELLED:'❌' };
  return map[status] || '📋';
};
