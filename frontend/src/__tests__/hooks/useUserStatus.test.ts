import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { useUserStatus } from '../../hooks/useUserStatus';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('useUserStatus Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('reads ticket number from URL hash on mount', async () => {
    window.location.hash = '#user?t=T-001';
    mockedAxios.get.mockResolvedValueOnce({ data: { ticketNumber: 'T-001', groupsAhead: 3 } });

    const { result } = renderHook(() => useUserStatus());

    expect(result.current.ticketNumber).toBe('T-001');
    await waitFor(() => {
      expect(result.current.entry).not.toBeNull();
      expect(result.current.entry?.groupsAhead).toBe(3);
    });
  });

  it('reads ticket number from query string on mount', async () => {
    window.history.pushState({}, '', '/?t=T-777#user');
    mockedAxios.get.mockResolvedValueOnce({ data: { ticketNumber: 'T-777', groupsAhead: 1 } });

    const { result } = renderHook(() => useUserStatus());

    await waitFor(() => {
      expect(result.current.ticketNumber).toBe('T-777');
      expect(result.current.entry?.ticketNumber).toBe('T-777');
    });
  });

  it('fetches status manually', async () => {
    const mockEntry = { id: 1, ticketNumber: 'T-005', groupsAhead: 10 };
    mockedAxios.get.mockResolvedValueOnce({ data: mockEntry });

    const { result } = renderHook(() => useUserStatus());

    await act(async () => {
      await result.current.fetchStatus('T-005');
    });

    expect(result.current.entry).toEqual(mockEntry);
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/queue/status/T-005'));
  });

  it('cancels position successfully', async () => {
    // Setup state first
    window.location.hash = '#user?t=T-001';
    mockedAxios.get.mockResolvedValueOnce({ data: { ticketNumber: 'T-001', groupsAhead: 3 } });
    const { result } = renderHook(() => useUserStatus());
    await waitFor(() => expect(result.current.entry).not.toBeNull());

    // Mock cancellation
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    let success;
    await act(async () => {
      success = await result.current.cancelPosition('09012345678');
    });

    expect(success).toBe(true);
    expect(result.current.entry).toBeNull();
    expect(result.current.message.text).toContain('Cancelled successfully');
  });

  it('handles error when fetching status', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { error: { code: 'TICKET_NOT_FOUND', message: 'Ticket not found' } } }
    });

    const { result } = renderHook(() => useUserStatus());

    await act(async () => {
      await result.current.fetchStatus('T-999');
    });

    expect(result.current.entry).toBeNull();
    expect(result.current.message.text).toBe('Ticket not found');
  });
});
