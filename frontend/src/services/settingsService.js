import api from './api';

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    const d = response.data;
    return {
      apiKey: d.gemini_api_key || '',
      chunkSize: d.chunk_size || 500,
      retrievalCount: d.retrieval_count || 5,
      theme: d.theme || 'dark'
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { apiKey: '', chunkSize: 500, retrievalCount: 5, theme: 'dark' };
    }
    throw error;
  }
};

export const saveSettings = async (settings) => {
  const payload = {
    gemini_api_key: settings.apiKey,
    chunk_size: settings.chunkSize,
    retrieval_count: settings.retrievalCount,
    theme: settings.theme
  };
  const response = await api.put('/settings', payload);
  return response.data;
};
