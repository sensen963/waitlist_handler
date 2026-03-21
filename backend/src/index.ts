import express from "express";
import cors from "cors";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { queueService } from "./services/queue.service";

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Validation schemas
const addEntrySchema = z.object({
  peopleCount: z.number().min(1),
  phoneNumber: z.string().min(1),
});

const cancelEntrySchema = z.object({
  ticketNumber: z.string(),
  phoneNumber: z.string(),
});

const reorderSchema = z.object({
  id: z.number(),
  action: z.enum(["UP", "DOWN", "TOP", "BOTTOM"]),
});

// Routes

// Kiosk: Get total waiting
app.get("/api/queue/stats", async (req, res) => {
  try {
    const totalWaiting = await queueService.getTotalWaiting();
    res.json({ totalWaiting });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Kiosk: Issue ticket
app.post("/api/queue", async (req, res) => {
  try {
    const { peopleCount, phoneNumber } = addEntrySchema.parse(req.body);
    const entry = await queueService.addEntry(peopleCount, phoneNumber);
    const groupsAhead = await queueService.getTotalWaiting(); // Total including self
    res.status(201).json({ ...entry, groupsAhead });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Failed to issue ticket" });
  }
});

// User: Get status by ticket number
app.get("/api/queue/status/:ticketNumber", async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const status = await queueService.getStatusByTicket(ticketNumber);
    if (!status) {
      return res.status(404).json({ error: "Ticket not found or already served" });
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

// User/Kiosk: Cancel entry
app.delete("/api/queue/cancel", async (req, res) => {
  try {
    const { ticketNumber, phoneNumber } = cancelEntrySchema.parse(req.body);
    await queueService.cancelEntry(ticketNumber, phoneNumber);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(403).json({ error: (error as Error).message });
  }
});

// Staff: Get all waiting entries
app.get("/api/queue", async (req, res) => {
  try {
    const queue = await queueService.getQueue();
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});

// Staff: Serve/Remove entry
app.delete("/api/queue/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await queueService.serveEntry(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to serve entry" });
  }
});

// Staff: Reorder entries
app.patch("/api/queue/reorder", async (req, res) => {
  try {
    const { id, action } = reorderSchema.parse(req.body);
    const updatedQueue = await queueService.reorder(id, action);
    res.json(updatedQueue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Failed to reorder" });
  }
});

// Staff: Reset queue (simulating end of day)
app.post("/api/queue/reset", async (req, res) => {
  try {
    await prisma.queueEntry.updateMany({
      where: { status: "WAITING" },
      data: { status: "CANCELLED", position: -1 },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset queue" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
