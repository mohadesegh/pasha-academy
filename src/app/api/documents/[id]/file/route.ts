import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readUpload } from "@/lib/storage";
import { scopeFor } from "@/lib/applications";

/** Streams an uploaded document to users who are allowed to see its application. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;

  const doc = await db.document.findFirst({ where: { id, application: scopeFor(user) } });
  if (!doc) return new Response("Not found", { status: 404 });

  let file: Buffer;
  try {
    file = await readUpload(doc.storedName);
  } catch {
    return new Response("File missing", { status: 410 });
  }

  const download = new URL(req.url).searchParams.has("download");
  const filename = encodeURIComponent(doc.originalName);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(file.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
