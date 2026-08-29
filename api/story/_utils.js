/* global Buffer, process */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { validateStoryOutline, validateStoryRequest } from '../../src/data/storybookValidation.js';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const SESSION_TTL_MS = 30 * 60 * 1000;
const buckets = new Map();
const ALLOWED_ORIGINS = new Set([
  'https://dinospace-eight.vercel.app',
  'https://dinospace-memas-projects-23a0001d.vercel.app',
  'https://dinospace-git-main-memas-projects-23a0001d.vercel.app',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
]);

export const parseBody = (raw) => {
  if (!raw || typeof raw !== 'object') {
    if (typeof raw !== 'string') return {};
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
};

export const clientId = (request) => {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return request.socket?.remoteAddress || 'unknown';
};

export const isAllowedOrigin = (request) => {
  const origin = request.headers.origin;
  if (typeof origin !== 'string') return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
  } catch { return false; }
};

export const applyCors = (request, response) => {
  const origin = request.headers.origin;
  if (origin && (ALLOWED_ORIGINS.has(origin) || /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin))) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Amari-Story-Session');
  }
};

export const respondJson = (response, status, body) => {
  response.setHeader('Cache-Control', 'no-store');
  response.status(status).json(body);
};

export const allowRequest = (id) => {
  const now = Date.now();
  const current = buckets.get(id);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    buckets.set(id, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
};

const sessionSecret = () => process.env.STORYBOOK_SESSION_SECRET || '';
const encode = (value) => Buffer.from(value).toString('base64url');

export const issueStorySession = () => {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS, nonce: randomBytes(12).toString('hex') }));
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

export const hasStorySession = (request) => {
  const token = request.headers['x-amari-story-session'];
  const secret = sessionSecret();
  if (typeof token !== 'string' || !secret) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(decoded.exp) && decoded.exp > Date.now();
  } catch { return false; }
};

export const validImageReference = (value) => (
  typeof value === 'string'
  && /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value)
  && value.length <= 12 * 1024 * 1024
);

export { validateStoryOutline, validateStoryRequest };
