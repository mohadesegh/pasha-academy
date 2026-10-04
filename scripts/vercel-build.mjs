import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

function run(module, args) {
  const result = spawnSync(process.execPath, [require.resolve(module), ...args], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const key of ["DATABASE_URL", "AUTH_SECRET", "BLOB_READ_WRITE_TOKEN", "CRON_SECRET"]) {
  if (!process.env[key]) throw new Error(`Set ${key} in Vercel Settings > Environment Variables. See DEPLOYMENT.fa.md.`);
}
if (process.env.AUTH_SECRET.length < 32 || process.env.AUTH_SECRET.startsWith("change-me")) {
  throw new Error("AUTH_SECRET must be a new random secret of at least 32 characters.");
}
if (process.env.CRON_SECRET.length < 32) throw new Error("CRON_SECRET must contain at least 32 random characters.");
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`;
}
run("prisma/build/index.js", ["generate"]);
// Preview deployments must use a separate database, never the production database.
run("prisma/build/index.js", ["migrate", "deploy"]);
if (process.env.VERCEL_ENV === "production") run("tsx/cli", ["prisma/bootstrap.ts"]);
run("next/dist/bin/next", ["build"]);
