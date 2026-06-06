import axios from 'axios';

import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // 2 minutes to allow for slow LLM generations
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // We can dispatch an event or call a global toast function here
    // For now, we return the rejected promise to let components handle it
    return Promise.reject(error);
  }
);

export default api;
