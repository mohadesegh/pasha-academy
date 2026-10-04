import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// The Neon integration always provides POSTGRES_PRISMA_URL; accept it when DATABASE_URL is absent.
const datasourceUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
