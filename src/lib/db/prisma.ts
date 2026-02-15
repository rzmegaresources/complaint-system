import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Strict TypeScript typing for the global object
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  } as ConstructorParameters<typeof PrismaClient>[0]);
}

// Singleton: reuse the existing instance during hot-reloads in development
export const db = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances during Next.js hot-reload in dev mode
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;
