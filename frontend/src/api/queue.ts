import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

export interface QueueEntry {
  id: number;
  ticketNumber: string;
  peopleCount: number;
  status: string;
  position: number;
  groupsAhead?: number;
  createdAt: string;
}

export const queueApi = {
  async getStats() {
    const response = await axios.get<{ totalWaiting: number }>(`${API_BASE_URL}/queue/stats`);
    return response.data;
  },

  async issueTicket(peopleCount: number, phoneNumber: string) {
    const response = await axios.post<QueueEntry>(`${API_BASE_URL}/queue`, {
      peopleCount,
      phoneNumber,
    });
    return response.data;
  },

  async getStatus(ticketNumber: string) {
    const response = await axios.get<QueueEntry>(`${API_BASE_URL}/queue/status/${ticketNumber}`);
    return response.data;
  },

  async cancelEntry(ticketNumber: string, phoneNumber: string) {
    const response = await axios.delete(`${API_BASE_URL}/queue/cancel`, {
      data: { ticketNumber, phoneNumber },
    });
    return response.data;
  },

  async getQueue() {
    const response = await axios.get<QueueEntry[]>(`${API_BASE_URL}/queue`);
    return response.data;
  },

  async serveEntry(id: number) {
    const response = await axios.delete(`${API_BASE_URL}/queue/${id}`);
    return response.data;
  },

  async reorder(id: number, action: "UP" | "DOWN" | "TOP" | "BOTTOM") {
    const response = await axios.patch<QueueEntry[]>(`${API_BASE_URL}/queue/reorder`, {
      id,
      action,
    });
    return response.data;
  },
};
