import express from 'express';
import crypto from 'crypto';
import {
  initiateMultipartUpload,
  getMultipartPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
} from '../../services/s3MultipartService.js';
import { generateS3Key } from '../../services/s3Service.js';
import { authenticate } from '../../core/auth.js';
import { validateTenant } from '../../middleware/tenantValidation.js';
import { logAudit } from '../../services/auditService.js';
import {
  RECORDING_START,
  UPLOAD_SUCCESS,
  UPLOAD_FAILED,
} from '../../constants/auditActions.js';

const router = express.Router();

router.use(authenticate);
router.use(validateTenant);

/**
 * INIT multipart upload
 */
router.post('/videos/multipart/init', async (req, res) => {
  const { contentType, package_code } = req.body;
  const { tenant_id } = req.user;

  if (!contentType || !package_code) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const recordingId = `rec_${crypto.randomUUID()}`;
  const key = generateS3Key(tenant_id, package_code, recordingId);

  const uploadId = await initiateMultipartUpload(key, contentType);

  // Audit Log: RECORDING_START
  logAudit({
    tenant_id,
    actor_id: req.user.id,
    action: RECORDING_START,
    entity_type: 'recording',
    entity_id: recordingId,
    metadata: { key, contentType, uploadId },
  });

  res.json({ uploadId, key, recordingId });
});

/**
 * Get presigned URL for a part
 */
router.post('/videos/multipart/part-url', async (req, res) => {
  const { key, uploadId, partNumber } = req.body;

  if (!key || !uploadId || !partNumber) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const url = await getMultipartPartUrl({
    key,
    uploadId,
    partNumber,
  });

  res.json({ url });
});

/**
 * COMPLETE multipart upload
 */
router.post('/videos/multipart/complete', async (req, res) => {
  const { key, uploadId, parts } = req.body;

  if (!key || !uploadId || !Array.isArray(parts)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  await completeMultipartUpload({
    key,
    uploadId,
    parts,
  });

  // Audit Log: UPLOAD_SUCCESS
  logAudit({
    tenant_id: req.user.tenant_id,
    actor_id: req.user.id,
    action: UPLOAD_SUCCESS,
    entity_type: 'recording',
    metadata: { key, uploadId },
  });

  res.json({ success: true });
});

/**
 * ABORT multipart upload
 */
router.post('/videos/multipart/abort', async (req, res) => {
  const { key, uploadId } = req.body;

  if (!key || !uploadId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  await abortMultipartUpload({ key, uploadId });

  // Audit Log: UPLOAD_FAILED (Aborted)
  logAudit({
    tenant_id: req.user.tenant_id,
    actor_id: req.user.id,
    action: UPLOAD_FAILED,
    entity_type: 'recording',
    metadata: { key, uploadId, reason: 'aborted_by_user' },
  });

  res.json({ aborted: true });
});

export default router;
