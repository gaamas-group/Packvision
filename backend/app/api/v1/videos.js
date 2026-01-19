import express from 'express';
import {
  generateUploadUrl,
  generateDownloadUrl,
} from '../../services/s3Service.js';
import { authenticate } from '../../core/auth.js';

const router = express.Router();

router.use(authenticate);

/**
 * POST /api/v1/videos/upload-url
 * Generate presigned URL for uploading a video
 */
router.post('/videos/upload-url', async (req, res) => {
  try {
    const { filename, contentType, folder = 'videos' } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    if (!contentType) {
      return res.status(400).json({ error: 'ContentType is required' });
    }

    const key = `${folder}/${Date.now()}-${filename}`;
    const uploadUrl = await generateUploadUrl(key, contentType);

    res.json({
      uploadUrl,
      key,
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
