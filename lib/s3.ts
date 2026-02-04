import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/** Parse AWS_REGION: allow "Europe (Stockholm) eu-north-1" or "eu-north-1" */
function getAwsRegion(): string {
  const raw = process.env.AWS_REGION || '';
  const code = raw.split(/\s+/).pop()?.trim();
  return code && /^[a-z]{2}-[a-z]+-\d+$/.test(code) ? code : raw || 'eu-north-1';
}

const region = getAwsRegion();
const bucket = process.env.AWS_S3_BUCKET || '';

export const s3Client = new S3Client({
  region,
  forcePathStyle: true,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      }
    : undefined,
});

export function getBucket(): string {
  return bucket;
}

export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

/** Generate a presigned GET URL for viewing an object (e.g. image). Expires in 1 hour. */
export async function getPresignedGetUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
