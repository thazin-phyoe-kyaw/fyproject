import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
};

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
