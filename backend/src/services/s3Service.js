import AWS from 'aws-sdk';
const { v4: uuidv4 } = require('uuid');
import path from 'path';
import logger from '../utils/logger.js';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-west-1',
});

const BUCKET = process.env.AWS_S3_BUCKET || 'capa-kyc-docs';
const USE_LOCAL = process.env.NODE_ENV === 'development' && !process.env.AWS_ACCESS_KEY_ID;

/**
 * Upload a file buffer to S3 (or local mock in dev)
 * Returns { url, key }
 */
export async function uploadToS3(file, prefix = 'uploads') {
  const ext = path.extname(file.originalname) || '.bin';
  const key = `${prefix}/${uuidv4()}${ext}`;

  if (USE_LOCAL) {
    // In dev without AWS creds, return a mock URL
    logger.warn('S3 upload mocked (no AWS credentials configured)');
    return { url: `https://mock-s3.local/${key}`, key }
  }

  await s3.upload({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ServerSideEncryption: 'AES256',
    ACL: 'private',
  }).promise();

  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  logger.info('Uploaded to S3', { key, size: file.size });
  return { url, key }
}

/**
 * Generate a pre-signed URL for temporary access to a private file
 */
export function getSignedUrl(key, expiresSeconds = 300) {
  if (USE_LOCAL) return `https://mock-s3.local/${key}`;
  return s3.getSignedUrl('getObject', { Bucket: BUCKET, Key: key, Expires: expiresSeconds });
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key) {
  if (USE_LOCAL) return;
  await s3.deleteObject({ Bucket: BUCKET, Key: key }).promise();
}
