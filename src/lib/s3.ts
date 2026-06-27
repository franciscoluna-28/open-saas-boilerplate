import { S3Client } from "@aws-sdk/client-s3";

function getS3Config() {
  const region = process.env.S3_REGION ?? process.env.AWS_REGION ?? "us-east-1";
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3 credentials not configured. Set S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY (or AWS_* equivalents).",
    );
  }

  return {
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    ...(endpoint ? { forcePathStyle: true } : {}),
  };
}

let s3Client: S3Client | undefined;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client(getS3Config());
  }
  return s3Client;
}

export const Bucket = process.env.S3_BUCKET ?? process.env.AWS_S3_BUCKET ?? "default";
