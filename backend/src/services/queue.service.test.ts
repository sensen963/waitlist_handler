import { queueService } from "./queue.service";
import prisma from "../lib/prisma";

// Mock PrismaClient
jest.mock("../lib/prisma", () => {
  const mockQueueEntry = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mPrismaClient = {
    queueEntry: mockQueueEntry,
    $transaction: jest.fn((callback) => callback({ queueEntry: mockQueueEntry })),
  };
  return mPrismaClient;
});

describe("queueService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addEntry", () => {
    it("should add a new entry with correct position and ticket number", async () => {
      (prisma.queueEntry.findFirst as jest.Mock).mockResolvedValue({ position: 5 });
      (prisma.queueEntry.create as jest.Mock).mockResolvedValue({ id: 42, position: 6 });
      (prisma.queueEntry.update as jest.Mock).mockResolvedValue({ id: 42, ticketNumber: "T-042", position: 6 });

      const result = await queueService.addEntry(2, "09012345678");

      expect(prisma.queueEntry.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          peopleCount: 2,
          phoneNumber: "09012345678",
          position: 6,
          status: "WAITING",
        }),
      }));
      expect(result.ticketNumber).toBe("T-042");
    });
  });

  describe("getStatusByTicket", () => {
    it("should return the entry with correct groupsAhead count", async () => {
      const mockQueue = [
        { id: 1, ticketNumber: "T-001", status: "WAITING" },
        { id: 2, ticketNumber: "T-002", status: "WAITING" },
        { id: 3, ticketNumber: "T-003", status: "WAITING" },
      ];
      (prisma.queueEntry.findUnique as jest.Mock).mockResolvedValue(mockQueue[1]); // User is T-002
      (prisma.queueEntry.findMany as jest.Mock).mockResolvedValue(mockQueue);

      const result = await queueService.getStatusByTicket("T-002");

      expect(result).not.toBeNull();
      expect(result?.groupsAhead).toBe(2); // T-001, T-002
    });

    it("should return null if ticket does not exist", async () => {
      (prisma.queueEntry.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await queueService.getStatusByTicket("T-999");
      expect(result).toBeNull();
    });
  });

  describe("cancelEntry", () => {
    it("should update status to CANCELLED if phone number matches", async () => {
      (prisma.queueEntry.findUnique as jest.Mock).mockResolvedValue({
        ticketNumber: "T-001",
        phoneNumber: "090-1111-1111",
      });
      (prisma.queueEntry.update as jest.Mock).mockResolvedValue({ status: "CANCELLED" });

      await queueService.cancelEntry("T-001", "090-1111-1111");

      expect(prisma.queueEntry.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { ticketNumber: "T-001" },
        data: expect.objectContaining({ status: "CANCELLED" }),
      }));
    });

    it("should throw error if phone number does not match", async () => {
      (prisma.queueEntry.findUnique as jest.Mock).mockResolvedValue({
        ticketNumber: "T-001",
        phoneNumber: "090-1111-1111",
      });

      await expect(queueService.cancelEntry("T-001", "090-0000-0000"))
        .rejects.toThrow("Invalid ticket number or phone number");
    });
  });

  describe("reorder", () => {
    const setupQueue = () => [
      { id: 1, position: 1, ticketNumber: "T-001" },
      { id: 2, position: 2, ticketNumber: "T-002" },
      { id: 3, position: 3, ticketNumber: "T-003" },
    ];

    it("should swap positions when moving UP", async () => {
      (prisma.queueEntry.findMany as jest.Mock).mockResolvedValue(setupQueue());
      (prisma.queueEntry.update as jest.Mock).mockImplementation(({ data }: any) => data);

      await queueService.reorder(2, "UP");

      expect(prisma.$transaction).toHaveBeenCalled();
      // First update should be id:2 getting position:1
      const firstUpdate = (prisma.queueEntry.update as jest.Mock).mock.calls[0][0];
      expect(firstUpdate.where.id).toBe(2);
      expect(firstUpdate.data.position).toBe(1);
    });

    it("should move to TOP correctly", async () => {
      (prisma.queueEntry.findMany as jest.Mock).mockResolvedValue(setupQueue());
      await queueService.reorder(3, "TOP");
      
      const firstUpdate = (prisma.queueEntry.update as jest.Mock).mock.calls[0][0];
      expect(firstUpdate.where.id).toBe(3);
      expect(firstUpdate.data.position).toBe(1);
    });

    it("should move to BOTTOM correctly", async () => {
      (prisma.queueEntry.findMany as jest.Mock).mockResolvedValue(setupQueue());
      await queueService.reorder(1, "BOTTOM");
      
      const lastUpdate = (prisma.queueEntry.update as jest.Mock).mock.calls[2][0];
      expect(lastUpdate.where.id).toBe(1);
      expect(lastUpdate.data.position).toBe(3);
    });

    it("should not change anything if already at TOP and moving UP", async () => {
      const queue = setupQueue();
      (prisma.queueEntry.findMany as jest.Mock).mockResolvedValue(queue);
      
      const result = await queueService.reorder(1, "UP");
      
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual(queue);
    });
  });
});
