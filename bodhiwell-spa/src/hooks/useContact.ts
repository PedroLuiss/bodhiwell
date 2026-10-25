import { useState } from 'react';
import { contactService } from '../services/contactService';
import { ContactRequest, ContactResponse } from '../types';

export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (data: ContactRequest): Promise<ContactResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactService.sendContactMessage(data);
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al enviar el mensaje';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
};