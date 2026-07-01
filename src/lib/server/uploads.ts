import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { R2_ENDPOINT, r2 } from "@/lib/config/r2.config";
import { env } from "@/lib/config/t3.config";
import { UPLOAD_MAX_SIZE } from "@/lib/products/upload-constants";
import { requireAdmin } from "@/lib/server/admin-guard";

const IMAGE_PREFIX = "product-images";

/**
 * Secret-safe fingerprint of a credential: shows enough to compare against the
 * dashboard/.env without leaking the value. e.g. "f0ec…b6 (len 32)".
 */
function fingerprint(value: string | undefined): string {
  if (!value) return "MISSING";
  if (value.length <= 8) return `len ${value.length}`;
  return `${value.slice(0, 4)}…${value.slice(-2)} (len ${value.length})`;
}

/**
 * Detect image type from magic bytes. Only the formats we allow are checked —
 * this doubles as content validation so we never trust the client-sent MIME.
 */
function detectImageType(buf: ArrayBuffer): { mime: string; ext: string } | null {
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
 * Upload a product image to R2 and return its public URL. Stateless: it does not
 * touch the DB — the caller stores the returned URL on the product via the
 * create/update product server fns. Admin-only.
 */
export const uploadProductImageFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected multipart form data");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin(getRequest());

    const file = data.get("file");
    if (!file || !(file instanceof File)) {
      throw new Error("Please provide a valid image file");
    }

    if (file.size > UPLOAD_MAX_SIZE) {
      throw new Error("File size must be less than 5MB");
    }

    const buffer = await file.arrayBuffer();
    const detected = detectImageType(buffer);
    if (!detected) {
      throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
    }

    const key = `${IMAGE_PREFIX}/${crypto.randomUUID()}.${detected.ext}`;
    const uploadUrl = `${R2_ENDPOINT}/${env.R2_BUCKET_NAME}/${key}`;

    let uploadRes: Response;
    try {
      uploadRes = await r2.fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": detected.mime },
        body: buffer,
      });
    } catch (err) {
      // Network/DNS/TLS failure — never reached R2 (e.g. wrong account id host).
      console.error("[R2] fetch threw before a response was received:", err);
      throw new Error("Could not reach R2. Check R2_ACCOUNT_ID / network.");
    }

    if (!uploadRes.ok) {
      const body = await uploadRes.text().catch(() => "");
      // On failure, log the request + secret-safe credential fingerprints so a
      // misconfigured token/bucket is easy to spot in the server logs.
      console.error(`[R2] upload FAILED ${uploadRes.status} ${uploadRes.statusText}`);
      console.error(`[R2] PUT ${uploadUrl}`);
      console.error(
        `[R2] account=${fingerprint(env.R2_ACCOUNT_ID)} key=${fingerprint(env.R2_ACCESS_KEY_ID)} secret=${fingerprint(env.R2_SECRET_ACCESS_KEY)} bucket=${env.R2_BUCKET_NAME}`,
      );
      console.error(`[R2] response body: ${body}`);
      // Surface R2's own error code (e.g. AccessDenied / SignatureDoesNotMatch)
      // to the client so the toast is actionable.
      const code = body.match(/<Code>([^<]+)<\/Code>/)?.[1];
      throw new Error(`R2 upload failed (${uploadRes.status}${code ? ` ${code}` : ""})`);
    }

    return { url: `${env.R2_PUBLIC_URL}/${key}` };
  });
