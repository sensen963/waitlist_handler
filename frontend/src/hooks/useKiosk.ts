import { useState, useEffect } from 'react';
import { queueApi, QueueEntry } from '../api/queue';

interface AxiosError {
  response?: {
    data?: {
      error?: unknown;
    };
  };
}

export const useKiosk = () => {
  const [totalWaiting, setTotalWaiting] = useState(0);
  const [issuedTicket, setIssuedTicket] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchStats = async () => {
    try {
      const { totalWaiting } = await queueApi.getStats();
      setTotalWaiting(totalWaiting);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const issueTicket = async (peopleCount: number, phoneNumber: string) => {
    if (!phoneNumber) {
      setMessage({ text: 'Please enter a phone number', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const ticket = await queueApi.issueTicket(peopleCount || 1, phoneNumber);
      setIssuedTicket(ticket);
      fetchStats();
    } catch (error: unknown) {
      const errorData = (error as AxiosError).response?.data?.error;
      const errorMsg = Array.isArray(errorData) 
        ? errorData.map((i: { message: string }) => i.message).join(', ')
        : (errorData || 'Failed to issue ticket');
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (ticketNumber: string, phoneNumber: string) => {
    if (!ticketNumber || !phoneNumber) {
      setMessage({ text: 'Please enter ticket and phone number', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await queueApi.cancelEntry(ticketNumber, phoneNumber);
      setMessage({ text: 'Entry cancelled successfully', type: 'success' });
      fetchStats();
      return true;
    } catch (error: unknown) {
      setMessage({ text: (error as AxiosError).response?.data?.error || 'Failed to cancel entry', type: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    totalWaiting,
    issuedTicket,
    loading,
    message,
    setIssuedTicket,
    issueTicket,
    cancelTicket,
    setMessage
  };
};
