import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { AppError } from './errorHandler'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        next(new AppError('Validation failed', 400, details))
      } else {
        next(error)
      }
    }
  }
}

// Common validation schemas
export const schemas = {
  pagination: z.object({
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(20),
      offset: z.coerce.number().min(0).optional().default(0),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional().default('desc'),
    }),
  }),

  id: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  }),

  dateRange: z.object({
    query: z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    }),
  }),
}