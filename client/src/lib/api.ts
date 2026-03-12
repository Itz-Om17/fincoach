const API_BASE_URL = 'http://localhost:5000/api';

export const fetchDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

export const fetchDashboardCharts = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/charts`);
  if (!response.ok) throw new Error('Failed to fetch charts');
  return response.json();
};

export const fetchRecommendations = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/recommendations`);
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};
