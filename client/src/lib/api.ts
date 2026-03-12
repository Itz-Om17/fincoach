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

export const createTransaction = async (transaction: any) => {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
};

export const fetchGoals = async () => {
  const response = await fetch(`${API_BASE_URL}/goals`);
  if (!response.ok) throw new Error('Failed to fetch goals');
  return response.json();
};

export const createGoal = async (goal: any) => {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
  if (!response.ok) throw new Error('Failed to create goal');
  return response.json();
};

export const fetchAIInsights = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/insights`);
  if (!response.ok) throw new Error('Failed to fetch AI insights');
  return response.json();
};

export const fetchChatHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/chat/history`);
  if (!response.ok) throw new Error('Failed to fetch chat history');
  return response.json();
};

export const sendChatMessage = async (message: string) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Failed to send chat message');
  return response.json();
};
export const generateRecommendations = async () => {
  const response = await fetch(`${API_BASE_URL}/coach/recommendations/generate`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to generate AI recommendations');
  return response.json();
};

export const clearChatHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/chat/history`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to clear chat history');
  return response.json();
};
export const updateGoal = async ({ id, data }: { id: string; data: any }) => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update goal');
  return response.json();
};

export const deleteGoal = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete goal');
  return response.json();
};

export const fetchForecast = async () => {
  const response = await fetch(`${API_BASE_URL}/forecast`);
  if (!response.ok) throw new Error('Failed to fetch forecast');
  return response.json();
};
export const bulkCreateTransactions = async (transactions: any[]) => {
  const response = await fetch(`${API_BASE_URL}/transactions/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactions),
  });
  if (!response.ok) throw new Error('Failed to bulk create transactions');
  return response.json();
};
