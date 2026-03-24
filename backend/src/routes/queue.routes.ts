import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { queueService } from "../services/queue.service";

const router = Router();

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

// Async wrapper to catch errors and pass to next()
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Routes

// Get stats
router.get("/stats", asyncHandler(async (req, res) => {
  const totalWaiting = await queueService.getTotalWaiting();
  res.json({ totalWaiting });
}));

// Issue ticket
router.post("/", asyncHandler(async (req, res) => {
  const { peopleCount, phoneNumber } = addEntrySchema.parse(req.body);
  const entry = await queueService.addEntry(peopleCount, phoneNumber);
  const stats = await queueService.getTotalWaiting();
  res.status(201).json({ ...entry, groupsAhead: stats });
}));

// Get current queue
router.get("/", asyncHandler(async (req, res) => {
  const queue = await queueService.getQueue();
  res.json(queue);
}));

// Get status by ticket number
router.get("/status/:ticketNumber", asyncHandler(async (req, res) => {
  const ticketNumber = req.params.ticketNumber as string;
  const status = await queueService.getStatusByTicket(ticketNumber);
  if (!status) {
    const error: any = new Error("Ticket not found or already served");
    error.status = 404;
    throw error;
  }
  res.json(status);
}));

// Cancel entry
router.delete("/cancel", asyncHandler(async (req, res) => {
  const { ticketNumber, phoneNumber } = cancelEntrySchema.parse(req.body);
  await queueService.cancelEntry(ticketNumber, phoneNumber);
  res.json({ success: true });
}));

// Serve entry
router.delete("/:id", asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id as string);
  await queueService.serveEntry(id);
  res.json({ success: true });
}));

// Reorder entries
router.patch("/reorder", asyncHandler(async (req, res) => {
  const { id, action } = reorderSchema.parse(req.body);
  const updatedQueue = await queueService.reorder(id, action);
  res.json(updatedQueue);
}));

// Reset queue
router.post("/reset", asyncHandler(async (req, res) => {
  await queueService.resetQueue();
  res.json({ success: true });
}));

export default router;
