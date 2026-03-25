import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { useKiosk } from '../../hooks/useKiosk';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('useKiosk Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with total waiting from stats', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { totalWaiting: 5 } });

    const { result } = renderHook(() => useKiosk());

    // Initially loading
    expect(result.current.totalWaiting).toBe(0);

    // Wait for stats to load
    await waitFor(() => {
      expect(result.current.totalWaiting).toBe(5);
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/queue/stats'));
  });

  it('issues a ticket successfully', async () => {
    mockedAxios.get.mockResolvedValue({ data: { totalWaiting: 5 } });
    const mockTicket = {
      id: 1,
      ticketNumber: 'T-001',
      peopleCount: 2,
      status: 'WAITING',
      position: 6,
      createdAt: new Date().toISOString()
    };
    mockedAxios.post.mockResolvedValueOnce({ data: mockTicket });

    const { result } = renderHook(() => useKiosk());

    await act(async () => {
      await result.current.issueTicket(2, '09012345678');
    });

    expect(result.current.issuedTicket).toEqual(mockTicket);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/queue'),
      { peopleCount: 2, phoneNumber: '09012345678' }
    );
  });

  it('handles error during ticket issuance', async () => {
    mockedAxios.get.mockResolvedValue({ data: { totalWaiting: 5 } });
    const errorMessage = 'Please enter a phone number';
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    const { result } = renderHook(() => useKiosk());

    await act(async () => {
      await result.current.issueTicket(2, '');
    });

    expect(result.current.issuedTicket).toBeNull();
    expect(result.current.message.text).toBe(errorMessage);
    expect(result.current.message.type).toBe('error');
  });

  it('cancels a ticket successfully', async () => {
    mockedAxios.get.mockResolvedValue({ data: { totalWaiting: 5 } });
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    const { result } = renderHook(() => useKiosk());

    let success;
    await act(async () => {
      success = await result.current.cancelTicket('T-001', '09012345678');
    });

    expect(success).toBe(true);
    expect(result.current.message.text).toContain('cancelled successfully');
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/queue/cancel'),
      expect.objectContaining({ data: { ticketNumber: 'T-001', phoneNumber: '09012345678' } })
    );
  });
});
