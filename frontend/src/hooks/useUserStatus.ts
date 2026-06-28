import { useState, useEffect } from 'react';
import { queueApi, QueueEntry } from '../api/queue';
import { extractApiErrorMessage } from '../api/error';
import { getTicketNumberFromLocation } from '../lib/ticketLocation';

export const useUserStatus = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const t = getTicketNumberFromLocation(window.location);
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
      setMessage({ text: extractApiErrorMessage(error, 'Ticket not found'), type: 'error' });
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
      setMessage({ text: extractApiErrorMessage(error, 'Failed to cancel'), type: 'error' });
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
