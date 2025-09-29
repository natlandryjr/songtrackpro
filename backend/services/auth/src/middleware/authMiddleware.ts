import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new AppError('No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw new AppError('Invalid token format', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
    ;(req as any).user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401))
    } else {
      next(error)
    }
  }
}