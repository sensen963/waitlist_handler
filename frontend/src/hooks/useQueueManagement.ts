import { useState, useEffect } from 'react';
import { queueApi, QueueEntry } from '../api/queue';

export const useQueueManagement = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const data = await queueApi.getQueue();
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch queue', error);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const serveEntry = async (id: number) => {
    if (!confirm('Mark this group as served?')) return;
    try {
      await queueApi.serveEntry(id);
      fetchQueue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      alert('Failed to serve entry');
    }
  };

  const reorder = async (id: number, action: 'UP' | 'DOWN' | 'TOP' | 'BOTTOM') => {
    setLoading(true);
    try {
      const updatedQueue = await queueApi.reorder(id, action);
      setQueue(updatedQueue);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      alert('Failed to reorder');
    } finally {
      setLoading(false);
    }
  };

  const resetQueue = async () => {
    if (!confirm('This will CLEAR ALL waiting groups. Are you sure? (End of Day reset)')) return;
    try {
      await queueApi.resetQueue();
      fetchQueue();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      alert('Failed to reset queue');
    }
  };

  return {
    queue,
    loading,
    serveEntry,
    reorder,
    resetQueue,
    refresh: fetchQueue
  };
};
