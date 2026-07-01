import { R2_ENDPOINT, r2 } from "@/lib/config/r2.config";
import { env } from "@/lib/config/t3.config";

/**
 * Delete an object from R2 given its public URL. No-op for URLs that don't live
 * in our bucket (e.g. legacy externally-hosted image URLs). Best-effort: logs
 * and swallows errors so a failed cleanup never blocks the primary update.
 *
 * Server-only: kept out of `uploads.ts` so nothing that touches R2/env config
 * gets pulled into the client bundle via the upload server fn.
 */
export async function deleteR2Object(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl?.startsWith(`${env.R2_PUBLIC_URL}/`)) return;

  const key = publicUrl.replace(`${env.R2_PUBLIC_URL}/`, "");
  try {
    const res = await r2.fetch(`${R2_ENDPOINT}/${env.R2_BUCKET_NAME}/${key}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error(`[R2] delete failed (${res.status}) for key: ${key}`);
    }
  } catch (err) {
    console.error(`[R2] delete threw for key: ${key}`, err);
  }
}
