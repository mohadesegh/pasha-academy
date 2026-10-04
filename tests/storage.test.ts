import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { saveUpload, readUpload, deleteUpload, resolveUpload, UploadError } from "../src/lib/storage";
import { UPLOAD_LIMIT_BYTES } from "../src/lib/constants";

test("rejects forged references before contacting storage", async () => {
  for (const value of [
    "null", "not json", "{}",
    JSON.stringify({ pathname: "staging/owner/", name: "passport.pdf" }),
    JSON.stringify({ pathname: "staging/other-user/file", name: "passport.pdf" }),
    JSON.stringify({ pathname: "staging/owner/../../documents/file", name: "passport.pdf" }),
    JSON.stringify({ pathname: "https://example.com/passport.pdf", name: "passport.pdf" }),
    JSON.stringify({ pathname: "staging/owner/%2e%2e", name: "passport.pdf" }),
    JSON.stringify({ pathname: "documents/file", name: "passport.pdf" }),
  ]) await assert.rejects(resolveUpload(value, "owner"), UploadError);
});

test("rejects empty, oversized, and disguised executable documents", async () => {
  await assert.rejects(saveUpload(new File([], "empty.pdf")), UploadError);
  await assert.rejects(saveUpload(new File([new Uint8Array(UPLOAD_LIMIT_BYTES + 1)], "large.pdf")), UploadError);
  await assert.rejects(saveUpload(new File(["<script>alert(1)</script>"], "passport.pdf", { type: "application/pdf" })), UploadError);
});

test("5 MB documents round-trip as a stream, with content-derived MIME and safe generated names", async () => {
  const previous = { dir: process.env.UPLOAD_DIR, token: process.env.BLOB_READ_WRITE_TOKEN, vercel: process.env.VERCEL };
  const dir = await mkdtemp(path.join(process.cwd(), "storage", "test-upload-"));
  process.env.UPLOAD_DIR = dir;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.VERCEL;
  try {
    const bytes = Buffer.alloc(UPLOAD_LIMIT_BYTES);
    bytes.write("%PDF-1.7");
    const saved = await saveUpload(new File([bytes], "../../passport.pdf", { type: "image/png" }));
    assert.equal(saved.mimeType, "application/pdf");
    assert.equal(saved.size, UPLOAD_LIMIT_BYTES);
    assert.match(saved.storedName, /^[a-f0-9-]+\.pdf$/);
    const actual = Buffer.from(await new Response(await readUpload(saved.storedName)).arrayBuffer());
    assert.deepEqual(actual, bytes);
    await deleteUpload(saved.storedName);
    await assert.rejects(readUpload(saved.storedName));
    process.env.VERCEL = "1";
    await assert.rejects(saveUpload(new File(["%PDF-1.7"], "file.pdf")), /private Vercel Blob/);
  } finally {
    for (const [key, value] of Object.entries({ UPLOAD_DIR: previous.dir, BLOB_READ_WRITE_TOKEN: previous.token, VERCEL: previous.vercel })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(process.cwd(), "storage"));
    await rm(dir, { recursive: true, force: true });
  }
});
