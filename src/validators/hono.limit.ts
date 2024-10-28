import { rateLimiter } from 'hono-rate-limiter';

export const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7', // Use draft-7 headers for rate-limiting response
  keyGenerator: (c) => c.req.header('cf-connecting-ip') ?? '', // Custom client identifier by IP
});