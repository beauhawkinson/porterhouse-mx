/** biome-ignore-all lint/suspicious/noConsole: server-side logging is intended */
import { R2_ENDPOINT, r2 } from "@/lib/config/r2.config";
import { env } from "@/lib/config/t3.config";
import { UPLOAD_MAX_SIZE } from "@/lib/products/upload-constants";

/**
 * Detect image type from magic bytes. Only the formats we allow are checked —
 * this doubles as content validation so we never trust the client-sent MIME.
 */
export function detectImageType(buf: ArrayBuffer): { mime: string; ext: string } | null {
  const bytes = new Uint8Array(buf);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: "image/png", ext: "png" };
  }
  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

/**
 * Validate and upload an image File to R2 under `${prefix}/`, returning its
 * public URL. Stateless — the caller records the URL wherever it belongs.
 */
export async function uploadImageToR2(
  file: File,
  prefix: string,
): Promise<{ url: string; key: string }> {
  if (file.size > UPLOAD_MAX_SIZE) {
    throw new Error("File size must be less than 5MB");
  }

  const buffer = await file.arrayBuffer();
  const detected = detectImageType(buffer);
  if (!detected) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
  }

  const key = `${prefix}/${crypto.randomUUID()}.${detected.ext}`;
  const uploadUrl = `${R2_ENDPOINT}/${env.R2_BUCKET_NAME}/${key}`;

  let res: Response;
  try {
    res = await r2.fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": detected.mime },
      body: buffer,
    });
  } catch (err) {
    console.error("[R2] fetch threw before a response was received:", err);
    throw new Error("Could not reach R2. Check R2_ACCOUNT_ID / network.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[R2] upload FAILED ${res.status} ${res.statusText} for ${uploadUrl}`);
    console.error(`[R2] response body: ${body}`);
    const code = body.match(/<Code>([^<]+)<\/Code>/)?.[1];
    throw new Error(`R2 upload failed (${res.status}${code ? ` ${code}` : ""})`);
  }

  return { url: `${env.R2_PUBLIC_URL}/${key}`, key };
}
