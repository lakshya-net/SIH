import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const getStorageConfig = () => {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY are required");
  }

  return { bucket, region, accessKeyId, secretAccessKey };
};

export async function uploadDocument(input: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const config = getStorageConfig();
  const client = new S3Client({
    region: config.region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType,
  }));

  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return publicBaseUrl ? `${publicBaseUrl}/${input.key}` : null;
}
