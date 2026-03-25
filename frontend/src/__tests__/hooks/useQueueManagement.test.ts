import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { useQueueManagement } from '../../hooks/useQueueManagement';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('useQueueManagement Hook', () => {
  const mockQueue = [
    { id: 1, ticketNumber: 'T-001', position: 1 },
    { id: 2, ticketNumber: 'T-002', position: 2 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful fetch on mount
    mockedAxios.get.mockResolvedValue({ data: mockQueue });
    // Mock window.confirm
    window.confirm = vi.fn().mockReturnValue(true);
  });

  it('fetches queue on mount', async () => {
    const { result } = renderHook(() => useQueueManagement());

    await waitFor(() => {
      expect(result.current.queue).toEqual(mockQueue);
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/queue'));
  });

  it('serves an entry', async () => {
    const { result } = renderHook(() => useQueueManagement());
    await waitFor(() => expect(result.current.queue).not.toHaveLength(0));

    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      await result.current.serveEntry(1);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedAxios.delete).toHaveBeenCalledWith(expect.stringContaining('/queue/1'));
    // Should re-fetch queue after serving
    expect(mockedAxios.get).toHaveBeenCalledTimes(2); 
  });

  it('reorders the queue', async () => {
    const { result } = renderHook(() => useQueueManagement());
    await waitFor(() => expect(result.current.queue).not.toHaveLength(0));

    const updatedQueue = [...mockQueue].reverse();
    mockedAxios.patch.mockResolvedValueOnce({ data: updatedQueue });

    await act(async () => {
      await result.current.reorder(2, 'UP');
    });

    expect(result.current.queue).toEqual(updatedQueue);
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      expect.stringContaining('/queue/reorder'),
      { id: 2, action: 'UP' }
    );
  });

  it('resets the queue', async () => {
    const { result } = renderHook(() => useQueueManagement());
    await waitFor(() => expect(result.current.queue).not.toHaveLength(0));

    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      await result.current.resetQueue();
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/queue/reset'));
  });
});
