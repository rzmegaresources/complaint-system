// FYP Complaint System - Prisma Configuration
// Database URLs are configured here (Prisma v7+)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Session Mode pooler (port 5432) — works for migrations unlike Transaction pooler (6543)
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
