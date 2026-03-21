import { PrismaClient, QueueEntry } from "@prisma/client";

const prisma = new PrismaClient();

export const queueService = {
  async addEntry(peopleCount: number, phoneNumber: string) {
    const lastEntry = await prisma.queueEntry.findFirst({
      where: { status: "WAITING" },
      orderBy: { position: "desc" },
    });
    const nextPosition = (lastEntry?.position || 0) + 1;

    // Create entry with placeholder ticketNumber
    const entry = await prisma.queueEntry.create({
      data: {
        ticketNumber: `TEMP-${Date.now()}`,
        peopleCount,
        phoneNumber,
        position: nextPosition,
        status: "WAITING",
      },
    });

    // Update with real ticketNumber
    const ticketNumber = `T-${entry.id.toString().padStart(3, "0")}`;
    return await prisma.queueEntry.update({
      where: { id: entry.id },
      data: { ticketNumber },
    });
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
    const updates = newQueue.map((e, i) =>
      prisma.queueEntry.update({
        where: { id: e.id },
        data: { position: i + 1 },
      })
    );
    await prisma.$transaction(updates);

    return await this.getQueue();
  },
};
