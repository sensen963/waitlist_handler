import { useState, useEffect } from 'react';
import { queueApi, QueueEntry } from '../api/queue';

interface AxiosError {
  response?: {
    data?: {
      error?: unknown;
    };
  };
}

export const useUserStatus = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    const t = params.get('t');
    if (t) {
      setTicketNumber(t);
      fetchStatus(t);
    }
  }, []);

  const fetchStatus = async (t: string) => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const data = await queueApi.getStatus(t);
      setEntry(data);
    } catch (error: unknown) {
      const errorData = (error as AxiosError).response?.data?.error;
      let errorMsg = 'Ticket not found';
      
      if (Array.isArray(errorData)) {
        errorMsg = errorData.map((i: { message: string }) => i.message).join(', ');
      } else if (typeof errorData === 'string') {
        errorMsg = errorData;
      }
      
      setMessage({ text: errorMsg, type: 'error' });
      setEntry(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelPosition = async (phoneNumber: string): Promise<boolean> => {
    if (!phoneNumber) {
      setMessage({ text: 'Please enter your phone number', type: 'error' });
      return false;
    }
    setLoading(true);
    try {
      await queueApi.cancelEntry(ticketNumber, phoneNumber);
      setMessage({ text: 'Cancelled successfully', type: 'success' });
      setEntry(null);
      return true;
    } catch (error: unknown) {
      const errorData = (error as AxiosError).response?.data?.error;
      let errorMsg = 'Failed to cancel';
      
      if (Array.isArray(errorData)) {
        errorMsg = errorData.map((i: { message: string }) => i.message).join(', ');
      } else if (typeof errorData === 'string') {
        errorMsg = errorData;
      }
      
      setMessage({ text: errorMsg, type: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    ticketNumber,
    setTicketNumber,
    entry,
    loading,
    message,
    setMessage,
    fetchStatus,
    cancelPosition
  };
};
