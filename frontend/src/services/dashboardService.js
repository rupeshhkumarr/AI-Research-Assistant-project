import api from './api';

export const getDashboardStats = async () => {
  try {
    // Catch errors individually so that if one endpoint fails (e.g. missing Supabase table), the others still resolve
    const [statsRes, docsRes, chatRes] = await Promise.all([
      api.get('/stats').catch(e => ({ data: {} })),
      api.get('/documents').catch(e => ({ data: [] })),
      api.get('/chat/history').catch(e => ({ data: [] }))
    ]);
    
    const data = statsRes.data || {};
    const docs = docsRes.data || [];
    const chats = chatRes.data || [];
    
    // Create recent activity from uploaded documents
    const recentActivity = docs
      .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
      .slice(0, 5)
      .map(doc => ({
        description: `Uploaded document: ${doc.filename}`,
        timestamp: doc.upload_date
      }));

    // Generate real chart data based on chat history
    const queryCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    chats.forEach(chat => {
      if (chat.created_at) {
        const d = new Date(chat.created_at);
        queryCounts[days[d.getDay()]] += 1;
      }
    });

    const chartData = [
      { name: 'Mon', queries: queryCounts['Mon'] },
      { name: 'Tue', queries: queryCounts['Tue'] },
      { name: 'Wed', queries: queryCounts['Wed'] },
      { name: 'Thu', queries: queryCounts['Thu'] },
      { name: 'Fri', queries: queryCounts['Fri'] },
      { name: 'Sat', queries: queryCounts['Sat'] },
      { name: 'Sun', queries: queryCounts['Sun'] },
    ];

    return {
      totalDocuments: data.total_documents || 0,
      totalChunks: data.total_chunks || 0,
      totalQueries: data.total_queries || 0,
      totalMessages: data.total_messages || 0,
      totalConversations: data.total_conversations || 0,
      recentActivity,
      chartData
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
       return { totalDocuments: 0, totalChunks: 0, totalQueries: 0, totalMessages: 0, totalConversations: 0, recentActivity: [], chartData: [] };
    }
    throw error;
  }
};
