import prisma from "../lib/prisma";
import { QueueEntry } from "@prisma/client";

export const queueService = {
  async addEntry(peopleCount: number, phoneNumber: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const lastEntry = await tx.queueEntry.findFirst({
          where: { status: "WAITING" },
          orderBy: { position: "desc" },
        });
        const nextPosition = (lastEntry?.position || 0) + 1;

        // Use a more unique temp ticket number to avoid collisions
        const tempId = Math.random().toString(36).substring(7);
        const entry = await tx.queueEntry.create({
          data: {
            ticketNumber: `TEMP-${Date.now()}-${tempId}`,
            peopleCount,
            phoneNumber,
            position: nextPosition,
            status: "WAITING",
          },
        });

        // Update with final ticket number based on incrementing ID
        const ticketNumber = `T-${entry.id.toString().padStart(3, "0")}`;
        
        return await tx.queueEntry.update({
          where: { id: entry.id },
          data: { ticketNumber },
        });
      });
    } catch (error) {
      console.error("Error in addEntry transaction:", error);
      throw error;
    }
  },

  async getQueue() {
    return await prisma.queueEntry.findMany({
      where: { status: "WAITING" },
      orderBy: { position: "asc" },
    });
  },

  async getStatusByTicket(ticketNumber: string) {
    const entry = await prisma.queueEntry.findUnique({
      where: { ticketNumber },
    });
    if (!entry || entry.status !== "WAITING") return null;

    const allWaiting = await this.getQueue();
    const groupsAhead = allWaiting.findIndex((e) => e.ticketNumber === ticketNumber) + 1;
    return { ...entry, groupsAhead };
  },

  async getTotalWaiting() {
    return await prisma.queueEntry.count({
      where: { status: "WAITING" },
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
      data: { status: "CANCELLED", position: -1 },
    });
  },

  async serveEntry(id: number) {
    return await prisma.queueEntry.update({
      where: { id },
      data: { status: "SERVED", position: -1 },
    });
  },

  async resetQueue() {
    return await prisma.queueEntry.updateMany({
      where: { status: "WAITING" },
      data: { status: "CANCELLED", position: -1 },
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
        where: { status: "WAITING" },
        orderBy: { position: "asc" },
      });
    });
  },
};
