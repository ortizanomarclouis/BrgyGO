import { useState } from 'react';
import api from './api';
import { useAuth } from './useAuth';

export const useDocumentRequest = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleRequest = async (requestData) => {
    setLoading(true);
    try {
      const userId = user?.id;
      
      // Check if there's an identity photo (file upload)
      if (requestData.identityPhoto) {
        // Use multipart form data for file uploads
        const formData = new FormData();
        formData.append('documentType', requestData.documentType);
        formData.append('purpose', requestData.purpose);
        formData.append('identityPhoto', requestData.identityPhoto);
        if (userId) {
          formData.append('userId', userId);
        }

        // POST to with-identity endpoint - let browser set multipart/form-data header
        const response = await api.post('/api/requests/with-identity', formData);
        console.log('Document request submitted successfully:', response.data);
        return { success: true, data: response.data };
      } else {
        // Use regular JSON for requests without files
        const url = userId ? `/api/requests?userId=${userId}` : '/api/requests';
        const response = await api.post(url, {
          documentType: requestData.documentType,
          purpose: requestData.purpose,
        });
        console.log('Document request submitted successfully:', response.data);
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('Document request error:', error);
      const errorMessage = 
        error.response?.data?.error || 
        error.response?.data?.message ||
        error.message || 
        'Request submission failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { handleRequest, loading };
};
