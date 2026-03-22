import dotenv from "dotenv";
dotenv.config();

import { queueService } from "./src/services/queue.service";
import prisma from "./src/lib/prisma";

async function test() {
  try {
    console.log("Adding entry...");
    const entry = await queueService.addEntry(2, "09012345678");
    console.log("Entry added:", entry);
  } catch (error) {
    console.error("Error in addEntry:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
