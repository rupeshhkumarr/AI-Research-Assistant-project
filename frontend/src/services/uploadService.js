import api from './api';

export const uploadDocuments = async (files, onProgress) => {
  const responses = [];
  const totalFiles = files.length;
  let completed = 0;

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file); // The backend expects 'file'

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && totalFiles === 1) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    
    responses.push(response.data);
    completed++;
    
    if (onProgress && totalFiles > 1) {
      onProgress(Math.round((completed * 100) / totalFiles));
    }
  }

  return responses;
};
