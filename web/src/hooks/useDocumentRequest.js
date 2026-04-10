import { useState } from 'react';
import api from './api';

export const useDocumentRequest = () => {
  const [loading, setLoading] = useState(false);

  const handleRequest = async (requestData) => {
    setLoading(true);
    try {
      await api.post('/api/requests', requestData);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Request submission failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { handleRequest, loading };
};
