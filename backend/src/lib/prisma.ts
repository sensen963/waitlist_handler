import { PrismaClient } from "@prisma/client";
import path from "path";

let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && databaseUrl.startsWith("file:.")) {
  const relativePath = databaseUrl.replace("file:", "");
  const absolutePath = path.resolve(process.cwd(), relativePath);
  databaseUrl = `file:${absolutePath}`;
}

console.log("DATABASE_URL (resolved):", databaseUrl);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ["error", "warn"],
});

export default prisma;
