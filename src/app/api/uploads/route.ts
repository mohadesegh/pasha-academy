import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { apiUser } from "@/lib/auth";
import { fail, unauthorized, rateLimit } from "@/lib/http";
import { ALLOWED_MIME, UPLOAD_LIMIT_BYTES } from "@/lib/constants";
import { isOwnedStagingPath } from "@/lib/storage";

export async function GET() {
  const user = await apiUser("STUDENT", "AGENT", "ADMIN");
  if (!user) return unauthorized();
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    return fail("فضای ذخیره مدارک هنوز تنظیم نشده است", 503);
  }
  return Response.json({ cloud: Boolean(process.env.BLOB_READ_WRITE_TOKEN), userId: user.id }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      request, body,
      onBeforeGenerateToken: async (pathname) => {
        const user = await apiUser("STUDENT", "AGENT", "ADMIN");
        if (!user) throw new Error("Unauthorized");
        if (!await rateLimit(request, `upload:${user.id}`, 30)) throw new Error("Too many uploads");
        if (!isOwnedStagingPath(pathname, user.id)) {
          throw new Error("Invalid upload path");
        }
        return {
          allowedContentTypes: Object.keys(ALLOWED_MIME),
          maximumSizeInBytes: UPLOAD_LIMIT_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
      onUploadCompleted: async () => {
        // Attachment happens only in the authenticated application routes after byte validation.
      },
    });
    return Response.json(result);
  } catch {
    return fail("بارگذاری انجام نشد؛ وارد حساب شوید و دوباره تلاش کنید");
  }
}
