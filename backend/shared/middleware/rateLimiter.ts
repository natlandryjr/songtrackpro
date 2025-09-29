import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// Rate limit configuration based on subscription tier
export const createRateLimiter = (tier: 'free' | 'starter' | 'professional' | 'enterprise' = 'free') => {
  const limits = {
    free: { windowMs: 60 * 60 * 1000, max: 100 },
    starter: { windowMs: 60 * 60 * 1000, max: 1000 },
    professional: { windowMs: 60 * 60 * 1000, max: 10000 },
    enterprise: { windowMs: 60 * 60 * 1000, max: 100000 },
  }

  const config = limits[tier]

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: 'Rate limit exceeded. Please upgrade your plan for higher limits.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: res.getHeader('Retry-After'),
        },
      })
    },
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise IP
      return (req as any).user?.userId || req.ip
    },
  })
}

// Default rate limiter
export const defaultRateLimiter = createRateLimiter('free')

// Aggressive rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts. Please try again later.',
  skipSuccessfulRequests: true,
})