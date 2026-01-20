import express from 'express';
import {
  generateUploadUrl,
  generateDownloadUrl,
  generateS3Key,
} from '../../services/s3Service.js';
import { authenticate } from '../../core/auth.js';
import { validateTenant } from '../../middleware/tenantValidation.js';

const router = express.Router();

router.use(authenticate);
router.use(validateTenant);

/**
 * POST /api/v1/videos/upload-url
 * Generate presigned URL for uploading a video
 */
router.post('/videos/upload-url', async (req, res) => {
  try {
    const { filename, contentType, package_code } = req.body;
    const { tenant_id } = req.user;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    if (!contentType) {
      return res.status(400).json({ error: 'ContentType is required' });
    }

    if (!package_code) {
      return res.status(400).json({ error: 'package code is required' });
    }

    // Generate recordingId (or use one from frontend if provided, but better to generate or use timestamp)
    const recordingId = `rec_${crypto.randomUUID()}`;

    // Generate S3 key using the required structure
    const key = generateS3Key(tenant_id, package_code, recordingId);

    const uploadUrl = await generateUploadUrl(key, contentType);

    res.json({
      uploadUrl,
      key,
      recordingId,
      contentType,
      bucket: process.env.AWS_S3_BUCKET_NAME || 'test-bucket',
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * GET /api/v1/videos/download-url/:key
 * Generate presigned URL for downloading a video
 */
router.get('/videos/download-url/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const downloadUrl = await generateDownloadUrl(key);

    res.json({
      downloadUrl,
      bucket: process.env.AWS_S3_BUCKET_NAME || 'test-bucket',
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

export default router;
