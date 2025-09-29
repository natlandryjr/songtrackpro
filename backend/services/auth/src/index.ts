import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import { errorHandler } from './middleware/errorHandler'
import { initDatabase } from './config/database'
import { initRedis } from './config/redis'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use('/api', authRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth' })
})

// Error handler
app.use(errorHandler)

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase()
    await initRedis()

    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()