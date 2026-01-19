import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.AWS_ENDPOINT, // Required for MinIO
  forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true', // Required for MinIO
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'test-bucket';

/**
 * Generate a presigned URL for uploading a file to S3
 * @param {string} key - S3 object key (file path)
 * @param {string} contentType - MIME type of the file (e.g., 'video/mp4', 'image/jpeg')
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @param {string} bucket - S3 bucket name (optional)
 * @returns {Promise<string>} Presigned URL
 */
export async function generateUploadUrl(
  key,
  contentType,
  expiresIn = 3600,
  bucket = BUCKET_NAME
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading a file from S3
 * @param {string} key - S3 object key (file path)
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @param {string} bucket - S3 bucket name (optional)
 * @returns {Promise<string>} Presigned URL
 */
export async function generateDownloadUrl(
  key,
  expiresIn = 3600,
  bucket = BUCKET_NAME
) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}
