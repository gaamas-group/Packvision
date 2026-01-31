import express from 'express';
import {
  generateUploadUrl,
  generateDownloadUrl,
} from '../../services/s3Service.js';
import { logAudit } from '../../services/auditService.js';
import { DOWNLOAD } from '../../constants/auditActions.js';

const router = express.Router();

/**
 * POST /api/v1/orders/:orderId/documents/upload-url
 * Generate presigned URL for uploading order documents
 */
// Add timestamp, maybe addition info
router.post('/orders/:orderId/documents/upload-url', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { filename, contentType, documentType = 'general' } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    if (!contentType) {
      return res.status(400).json({ error: 'ContentType is required' });
    }

    const key = `orders/${orderId}/${documentType}/${Date.now()}-${filename}`;
    const uploadUrl = await generateUploadUrl(key, contentType);

    res.json({
      uploadUrl,
      key,
      orderId,
      contentType,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * GET /api/v1/orders/:orderId/documents/download-url/:key
 * Generate presigned URL for downloading order documents
 */
router.get('/orders/:orderId/:key', async (req, res) => {
  try {
    const { orderId, key } = req.params;

    res.json({
      key,
      orderId,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

router.get('/orders/:key/download-url', async (req, res) => {
  try {
    const { key } = req.params;
    const downloadUrl = await generateDownloadUrl(key);

    // Audit Log: DOWNLOAD
    if (req.user) {
      logAudit({
        tenant_id: req.user.tenant_id,
        actor_id: req.user.id,
        action: DOWNLOAD,
        entity_type: 'order_document',
        metadata: { key },
      });
    }

    res.json({ downloadUrl, expiresIn: 3600 });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

/**
 * GET /api/v1/orders
 * Get all orders (stub)
 */
router.get('/orders', (req, res) => {
  res.json({ orders: [] });
});

export default router;
