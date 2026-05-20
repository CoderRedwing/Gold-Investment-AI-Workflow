import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || { message: 'Network error' })
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Portfolio
export const getPortfolio = () => api.get('/portfolio');

// Price
export const getLivePrice = () => api.get('/price/live');
export const getPriceHistory = (days = 30) => api.get(`/price/history?days=${days}`);

// Trade
export const buyGold = (amountInINR) => api.post('/gold-purchase', { amountInINR });
export const sellGold = (goldInGrams) => api.post('/gold-sell', { goldInGrams });

// AI Advisor (Updated to use native streaming fetch to bypass Axios data intercepts)
export const askAdvisor = async (question, onChunk) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/gold-advisor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to communicate with advisor');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    if (done) break;

    const rawChunk = decoder.decode(value, { stream: true });
    const lines = rawChunk.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.replace('data: ', '').trim();

        if (dataStr === '[DONE]') {
          done = true;
          break;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.chunk && typeof onChunk === 'function') {
            onChunk(parsed.chunk);
          }
        } catch (e) {
          // Skip clean up fragment boundaries safely
        }
      }
    }
  }
};

// SIP
export const getSIPs = () => api.get('/sip');
export const createSIP = (data) => api.post('/sip', data);
export const toggleSIP = (id, isActive) => api.patch(`/sip/${id}`, { isActive });
export const deleteSIP = (id) => api.delete(`/sip/${id}`);

// Alerts
export const getAlerts = () => api.get('/alerts');
export const createAlert = (data) => api.post('/alerts', data);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);

// Webhooks
export const getWebhooks = () => api.get('/webhooks');
export const createWebhook = (data) => api.post('/webhooks', data);
export const deleteWebhook = (id) => api.delete(`/webhooks/${id}`);

// Receipts
export const getReceipt = (txId) => api.get(`/receipts/${txId}`);

export default api;