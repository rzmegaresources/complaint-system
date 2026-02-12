import { PrismaClient } from "@prisma/client";

// Strict TypeScript typing for the global object
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Singleton: reuse the existing instance during hot-reloads in development
export const db = globalForPrisma.prisma ?? new PrismaClient();

// Prevent multiple instances during Next.js hot-reload in dev mode
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
