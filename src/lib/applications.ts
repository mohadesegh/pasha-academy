import "server-only";
import { db } from "./db";
import type { CurrentUser } from "./auth";

/** Where-clause that limits applications to what the given user may see. */
export function scopeFor(user: CurrentUser) {
  if (user.role === "ADMIN") return {};
  if (user.role === "AGENT") return { agentId: user.id };
  return { studentId: user.id };
}

export async function findApplicationFor(user: CurrentUser, id: string) {
  return db.application.findFirst({
    where: { id, ...scopeFor(user) },
    include: {
      university: { select: { id: true, name: true, slug: true } },
      agent: { select: { id: true, name: true, companyName: true, email: true } },
      student: { select: { id: true, name: true, email: true } },
      documents: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type ApplicationWithRelations = NonNullable<Awaited<ReturnType<typeof findApplicationFor>>>;

export function actorLabel(user: CurrentUser) {
  if (user.role === "ADMIN") return "پاشا آکادمی";
  if (user.role === "AGENT") return `نماینده: ${user.companyName ?? user.name}`;
  return user.name;
}

export async function logEvent(applicationId: string, message: string, actor: string) {
  await db.applicationEvent.create({ data: { applicationId, message, actor } });
}
