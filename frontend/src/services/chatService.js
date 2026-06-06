import api from './api';
import { supabase } from './supabaseClient';

export const sendChatMessage = async (payload) => {
  const response = await api.post('/chat', payload);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
};

export const renameConversation = async (conversationId, title) => {
  const response = await api.put(`/conversations/${conversationId}`, { title });
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/conversations/${conversationId}`);
  return response.data;
};

export const clearAllConversations = async () => {
  const response = await api.delete('/conversations');
  return response.data;
};

// Legacy for backwards compatibility if needed elsewhere
// Legacy for backwards compatibility if needed elsewhere
export const getChatHistory = async () => {
  try {
    const response = await api.get('/chat/history');
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) return [];
    throw err;
  }
};

export const streamChatMessage = async (payload, onMessage, onError, onComplete, abortController) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    console.log("=========================================");
    console.log("CHAT REQUEST SENT - Payload:", payload);
    console.log("=========================================");

    const response = await fetch(`${apiUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: abortController?.signal
    });

    if (!response.ok) {
      let errorDetail = 'Failed to stream response';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) {}
      throw new Error(errorDetail);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; 

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6).trim();
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                throw new Error(data.error);
              }
              onMessage(data);
            } catch (err) {
              if (err.message !== 'Unexpected end of JSON input') {
                 if (onError) onError(err);
                 return; // Stop processing
              }
            }
          }
        }
      }
    }
    
    if (buffer.startsWith('data: ')) {
      const dataStr = buffer.substring(6).trim();
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          onMessage(data);
        } catch (err) {}
      }
    }

    if (onComplete) onComplete(false);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream aborted');
      if (onComplete) onComplete(true);
    } else {
      if (onError) onError(err);
    }
  }
};
