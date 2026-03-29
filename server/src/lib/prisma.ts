// src/lib/prisma.ts
import "dotenv/config"; // Make sure .env is loaded

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon for Node.js environment
const neonConfig = {
  webSocketConstructor: ws,
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env");
} else {
  console.log("here:", connectionString);
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // ← This is the important fix
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
