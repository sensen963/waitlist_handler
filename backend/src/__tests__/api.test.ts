import request from "supertest";
import app from "../index";
import { queueService } from "../services/queue.service";

jest.mock("../services/queue.service");

describe("API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/queue/stats", () => {
    it("should return total waiting count", async () => {
      (queueService.getTotalWaiting as jest.Mock).mockResolvedValue(5);
      const res = await request(app).get("/api/queue/stats");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ totalWaiting: 5 });
    });
  });

  describe("POST /api/queue", () => {
    it("should issue a new ticket", async () => {
      const mockEntry = { id: 1, ticketNumber: "T-001", peopleCount: 2 };
      (queueService.addEntry as jest.Mock).mockResolvedValue(mockEntry);
      (queueService.getTotalWaiting as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .post("/api/queue")
        .send({ peopleCount: 2, phoneNumber: "09012345678" });

      expect(res.status).toBe(201);
      expect(res.body.ticketNumber).toBe("T-001");
    });

    it("should return 400 for invalid data", async () => {
      const res = await request(app)
        .post("/api/queue")
        .send({ peopleCount: 0 }); // Invalid
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/queue/status/:ticketNumber", () => {
    it("should return status for valid ticket", async () => {
      const mockStatus = { ticketNumber: "T-001", groupsAhead: 3 };
      (queueService.getStatusByTicket as jest.Mock).mockResolvedValue(mockStatus);

      const res = await request(app).get("/api/queue/status/T-001");
      expect(res.status).toBe(200);
      expect(res.body.groupsAhead).toBe(3);
    });

    it("should return 404 for non-existent ticket", async () => {
      (queueService.getStatusByTicket as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get("/api/queue/status/INVALID");
      expect(res.status).toBe(404);
    });
  });
});
