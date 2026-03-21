import { queueService } from "./src/services/queue.service";
import { PrismaClient } from "@prisma/client";

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log("Adding first entry...");
    const e1 = await queueService.addEntry(2, "09011112222");
    console.log("First entry added:", e1.ticketNumber);

    console.log("Adding second entry...");
    const e2 = await queueService.addEntry(3, "09033334444");
    console.log("Second entry added:", e2.ticketNumber);
  } catch (error) {
    console.error("Error in test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
