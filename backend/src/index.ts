import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import queueRouter from "./routes/queue.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
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
