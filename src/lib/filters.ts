import type { Prisma } from "@prisma/client";
import { APP_STATUS_KEYS, APP_TYPE_KEYS } from "./constants";

export function buildApplicationWhere(sp: Record<string, string | undefined>): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = {};
  if (sp.status && (APP_STATUS_KEYS as readonly string[]).includes(sp.status)) where.status = sp.status;
  if (sp.type && (APP_TYPE_KEYS as readonly string[]).includes(sp.type)) where.type = sp.type;
  if (sp.scholarship === "1") where.scholarshipPercent = { not: null };
  if (sp.agent) where.agentId = sp.agent;
  const q = sp.q?.trim();
  if (q) {
    where.OR = [
      { studentName: { contains: q } },
      { code: { contains: q.toUpperCase() } },
      { studentEmail: { contains: q.toLowerCase() } },
      { studentPhone: { contains: q } },
    ];
  }
  return where;
}
