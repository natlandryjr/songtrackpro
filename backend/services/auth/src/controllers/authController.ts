import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User'
import RefreshToken from '../models/RefreshToken'
import { AppError } from '../middleware/errorHandler'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      throw new AppError('Email already exists', 400)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, name, passwordHash })

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as SignOptions
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as SignOptions
    )

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await User.findOne({ where: { email } })
    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401)
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as SignOptions
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as SignOptions
    )

    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId
    await RefreshToken.destroy({ where: { userId } })
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400)
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }

    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken, userId: decoded.userId },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401)
    }

    const user = await User.findByPk(decoded.userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as SignOptions
    )

    res.json({
      accessToken: newAccessToken,
      refreshToken,
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}