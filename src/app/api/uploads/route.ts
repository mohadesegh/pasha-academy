import { handleUpload, handleUploadPresigned, type HandleUploadBody } from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { apiUser } from "@/lib/auth";
import { fail, unauthorized, rateLimit } from "@/lib/http";
import { ALLOWED_MIME, UPLOAD_LIMIT_BYTES } from "@/lib/constants";
import { blobConfigured, isOwnedStagingPath } from "@/lib/storage";

type PresignedBody = Parameters<typeof handleUploadPresigned>[0]["body"];

export async function GET() {
  const user = await apiUser("STUDENT", "AGENT", "ADMIN");
  if (!user) return unauthorized();
  if (process.env.VERCEL && !blobConfigured()) {
    return fail("فضای ذخیره مدارک هنوز تنظیم نشده است", 503);
  }
  // Stores connected without a read-write token (OIDC) only support presigned client uploads.
  return Response.json({ cloud: blobConfigured(), presigned: !process.env.BLOB_READ_WRITE_TOKEN, userId: user.id }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

/** Authenticates the caller and returns the constraints every staged upload must satisfy. */
async function authorize(request: Request, pathname: string) {
  const user = await apiUser("STUDENT", "AGENT", "ADMIN");
  if (!user) throw new Error("Unauthorized");
  if (!await rateLimit(request, `upload:${user.id}`, 30)) throw new Error("Too many uploads");
  if (!isOwnedStagingPath(pathname, user.id)) {
    throw new Error("Invalid upload path");
  }
  return {
    allowedContentTypes: Object.keys(ALLOWED_MIME),
    maximumSizeInBytes: UPLOAD_LIMIT_BYTES,
    validUntil: Date.now() + 10 * 60 * 1000,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody | PresignedBody;
    if (body.type === "blob.generate-presigned-url" || !process.env.BLOB_READ_WRITE_TOKEN) {
      const result = await handleUploadPresigned({
        request, body: body as PresignedBody,
        getSignedToken: async (pathname) => {
          const limits = await authorize(request, pathname);
          const token = await issueSignedToken({ pathname, operations: ["put"], ...limits });
          return { token, urlOptions: { ...limits, addRandomSuffix: true, allowOverwrite: false } };
        },
      });
      return Response.json(result);
    }
    const result = await handleUpload({
      request, body: body as HandleUploadBody,
      onBeforeGenerateToken: async (pathname) => ({
        ...await authorize(request, pathname), addRandomSuffix: true, allowOverwrite: false,
      }),
      onUploadCompleted: async () => {
        // Attachment happens only in the authenticated application routes after byte validation.
      },
    });
    return Response.json(result);
  } catch {
    return fail("بارگذاری انجام نشد؛ وارد حساب شوید و دوباره تلاش کنید");
  }
}
