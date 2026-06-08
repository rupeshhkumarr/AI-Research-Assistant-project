import api from './api';

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data.map(doc => ({
    ...doc,
    filename: doc.filename,
    size: 'N/A', // file_size was removed from schema
    total_chunks: doc.chunks_count, // map chunks_count to what frontend expects
    upload_date: doc.upload_date
  }));
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};
