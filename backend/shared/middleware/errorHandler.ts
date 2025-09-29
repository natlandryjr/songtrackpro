import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean
  details?: any[]

  constructor(message: string, statusCode: number, details?: any[]) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: getErrorCode(err.statusCode),
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    })
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database validation failed',
        details: (err as any).errors.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      },
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists',
      },
    })
  }

  // Log unexpected errors
  console.error('Unexpected error:', err)

  res.status(500).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}

function getErrorCode(statusCode: number): string {
  const codes: Record<number, string> = {
    400: 'VALIDATION_ERROR',
    401: 'AUTHENTICATION_ERROR',
    403: 'AUTHORIZATION_ERROR',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'SERVER_ERROR',
    502: 'INTEGRATION_ERROR',
  }
  return codes[statusCode] || 'UNKNOWN_ERROR'
}