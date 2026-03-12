const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const login = async (credentials: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
};

export const signup = async (userData: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  return response.json();
};

export const fetchDashboardStats = async (month?: number, year?: number) => {
  let url = `${API_BASE_URL}/dashboard/stats`;
  const params = new URLSearchParams();
  if (month !== undefined) params.append('month', month.toString());
  if (year !== undefined) params.append('year', year.toString());
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
};

export const fetchDashboardCharts = async (month?: number, year?: number) => {
  let url = `${API_BASE_URL}/dashboard/charts`;
  const params = new URLSearchParams();
  if (month !== undefined) params.append('month', month.toString());
  if (year !== undefined) params.append('year', year.toString());
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch dashboard charts");
  return res.json();
};

export const fetchRecommendations = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/recommendations`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
};

export const fetchTransactions = async (type?: string, category?: string) => {
  const params = new URLSearchParams();
  if (type && type !== 'all') params.append('type', type);
  if (category && category !== 'all') params.append('category', category);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/transactions${queryString}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions/categories`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const createTransaction = async (transaction: any) => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
};

export const fetchGoals = async () => {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch goals');
  return response.json();
};

export const createGoal = async (goal: any) => {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(goal),
  });
  if (!response.ok) throw new Error('Failed to create goal');
  return response.json();
};

export const fetchAIInsights = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/insights`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch AI insights');
  return response.json();
};

export const fetchChatHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/chat/history`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch chat history');
  return response.json();
};

export const sendChatMessage = async (message: string) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Failed to send chat message');
  return response.json();
};
export const generateRecommendations = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/recommendations/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to generate AI recommendations');
  return response.json();
};

export const clearChatHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/chat/history`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to clear chat history');
  return response.json();
};
export const updateGoal = async ({ id, data }: { id: string; data: any }) => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update goal');
  return response.json();
};

export const deleteGoal = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete goal');
  return response.json();
};

export const fetchForecast = async () => {
  const response = await fetch(`${API_BASE_URL}/forecast`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch forecast');
  return response.json();
};
export const bulkCreateTransactions = async (transactions: any[]) => {
  const response = await fetch(`${API_BASE_URL}/transactions/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(transactions),
  });
  if (!response.ok) throw new Error('Failed to bulk create transactions');
  return response.json();
};

export const fetchBudgets = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/budgets`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch budgets');
  return response.json();
};

export const saveBudgets = async (budgets: { category: string; limit: number }[]) => {
  const response = await fetch(`${API_BASE_URL}/coach/budgets`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(budgets),
  });
  if (!response.ok) throw new Error('Failed to save budgets');
  return response.json();
};

export const fetchUnreadNotificationsCount = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch unread count');
  return response.json();
};

export const markNotificationsAsRead = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/notifications/mark-read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to mark notifications as read');
  return response.json();
};

export const fetchUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
};

export const updateUserProfile = async (userData: { name?: string; email?: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

