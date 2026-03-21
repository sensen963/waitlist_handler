import { queueService } from "./src/services/queue.service";
import { PrismaClient } from "@prisma/client";

async function test() {
  const prisma = new PrismaClient();
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
