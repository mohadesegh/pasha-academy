import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

// Exclusive creation preserves previously configured secrets on reruns.
const contents = [
  "# Copy these values to Vercel > Settings > Environment Variables (Production).",
  "# This file is gitignored. Do not publish it or paste its contents into chat.",
  `AUTH_SECRET=${randomBytes(48).toString("base64url")}`,
  `CRON_SECRET=${randomBytes(48).toString("base64url")}`,
  `ADMIN_PASSWORD=${randomBytes(24).toString("base64url")}`,
  "ADMIN_EMAIL=", "",
].join("\n");
try {
  writeFileSync(".env.vercel.local", contents, { flag: "wx", mode: 0o600 });
  console.log("Created .env.vercel.local. Add your ADMIN_EMAIL and copy its values into Vercel. Secrets were not printed.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log(".env.vercel.local already exists; existing secrets preserved.");
}
