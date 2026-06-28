import prisma from "../lib/prisma";
import { randomUUID } from "crypto";

const STATUS = {
  WAITING: "WAITING",
  SERVED: "SERVED",
  CANCELLED: "CANCELLED",
} as const;

export const queueService = {
  async addEntry(peopleCount: number, phoneNumber: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const entry = await tx.queueEntry.create({
          data: {
            ticketNumber: `TEMP-${randomUUID()}`,
            peopleCount,
            phoneNumber,
            position: null,
            status: STATUS.WAITING,
          },
        });

        const ticketNumber = `T-${entry.id.toString().padStart(3, "0")}`;
        
        return await tx.queueEntry.update({
          where: { id: entry.id },
          data: {
            ticketNumber,
            position: entry.id,
          },
        });
      });
    } catch (error) {
      console.error("Error in addEntry transaction:", error);
      throw error;
    }
  },

  async getQueue() {
    return await prisma.queueEntry.findMany({
      where: { status: STATUS.WAITING },
      orderBy: { position: "asc" },
    });
  },

  async getStatusByTicket(ticketNumber: string) {
    const entry = await prisma.queueEntry.findUnique({
      where: { ticketNumber },
    });
    if (!entry || entry.status !== STATUS.WAITING || entry.position == null) return null;

    const groupsAhead = await prisma.queueEntry.count({
      where: {
        status: STATUS.WAITING,
        position: { lte: entry.position },
      },
    });

    return { ...entry, groupsAhead };
  },

  async getTotalWaiting() {
    return await prisma.queueEntry.count({
      where: { status: STATUS.WAITING },
    });
  },

  async cancelEntry(ticketNumber: string, phoneNumber: string) {
    const entry = await prisma.queueEntry.findUnique({
      where: { ticketNumber },
    });
    if (!entry || entry.phoneNumber !== phoneNumber) {
      throw new Error("Invalid ticket number or phone number");
    }
    return await prisma.queueEntry.update({
      where: { ticketNumber },
      data: { status: STATUS.CANCELLED, position: null },
    });
  },

  async serveEntry(id: number) {
    return await prisma.queueEntry.update({
      where: { id },
      data: { status: STATUS.SERVED, position: null },
    });
  },

  async resetQueue() {
    return await prisma.queueEntry.updateMany({
      where: { status: STATUS.WAITING },
      data: { status: STATUS.CANCELLED, position: null },
    });
  },

  async deleteEntry(id: number) {
    return await prisma.queueEntry.delete({
      where: { id },
    });
  },

  async reorder(id: number, action: "UP" | "DOWN" | "TOP" | "BOTTOM") {
    const currentQueue = await this.getQueue();
    const index = currentQueue.findIndex((e) => e.id === id);
    if (index === -1) return currentQueue;

    const entry = currentQueue[index];
    let newQueue = [...currentQueue];

    if (action === "UP" && index > 0) {
      [newQueue[index - 1], newQueue[index]] = [newQueue[index], newQueue[index - 1]];
    } else if (action === "DOWN" && index < newQueue.length - 1) {
      [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
    } else if (action === "TOP" && index > 0) {
      newQueue.splice(index, 1);
      newQueue.unshift(entry);
    } else if (action === "BOTTOM" && index < newQueue.length - 1) {
      newQueue.splice(index, 1);
      newQueue.push(entry);
    } else {
      return currentQueue; // No change
    }

    // Update positions in DB
    return await prisma.$transaction(async (tx) => {
      const updates = newQueue.map((e, i) =>
        tx.queueEntry.update({
          where: { id: e.id },
          data: { position: i + 1 },
        })
      );
      await Promise.all(updates);
      return await tx.queueEntry.findMany({
        where: { status: STATUS.WAITING },
        orderBy: { position: "asc" },
      });
    });
  },
};
