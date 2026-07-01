import { AwsClient } from "aws4fetch";

import { env } from "@/lib/config/t3.config";

export const r2 = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
});

export const R2_ENDPOINT = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
