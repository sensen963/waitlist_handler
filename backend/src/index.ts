import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import queueRouter from "./routes/queue.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error: Error & { status?: number; code?: string } = new Error("Origin not allowed by CORS");
    error.status = 403;
    error.code = "CORS_ORIGIN_DENIED";
    return callback(error);
  },
}));
app.use(express.json());

// Routes
app.use("/api/queue", queueRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
