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

  describe("reorder", () => {
    it("should swap positions when moving UP", async () => {
      const mockQueue = [
        { id: 1, position: 1, ticketNumber: "T-001" },
        { id: 2, position: 2, ticketNumber: "T-002" },
        { id: 3, position: 3, ticketNumber: "T-003" },
      ];
      (prisma.queueEntry.findMany as jest.Mock).mockResolvedValue(mockQueue);
      (prisma.queueEntry.update as jest.Mock).mockImplementation(({ data }: any) => data);

      await queueService.reorder(2, "UP");

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.queueEntry.findMany).toHaveBeenCalled();
    });
  });
});
