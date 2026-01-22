import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  isAwsCredentialsConfigured,
  getAwsCredentials,
} from '../../utils/awsConfig.js';

if (!isAwsCredentialsConfigured()) {
  throw new Error(
    'FATAL_ERROR: AWS credentials are not configured in environment variables',
  );
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: getAwsCredentials(),
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
if (!BUCKET) {
  throw new Error(
    'FATAL_ERROR: AWS_S3_BUCKET_NAME is not defined in environment variables',
  );
}

export async function initiateMultipartUpload(key, contentType) {
  const cmd = new CreateMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const res = await s3Client.send(cmd);
  return res.UploadId;
}

export async function getMultipartPartUrl({
  key,
  uploadId,
  partNumber,
  expiresIn = 3600,
}) {
  const cmd = new UploadPartCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  return getSignedUrl(s3Client, cmd, { expiresIn });
}

export async function completeMultipartUpload({ key, uploadId, parts }) {
  const cmd = new CompleteMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });

  return s3Client.send(cmd);
}

export async function abortMultipartUpload({ key, uploadId }) {
  const cmd = new AbortMultipartUploadCommand({
    Bucket: BUCKET,
    Key: key,
    UploadId: uploadId,
  });

  return s3Client.send(cmd);
}
