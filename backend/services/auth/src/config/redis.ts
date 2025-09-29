import { createClient } from 'redis'

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
})

export const initRedis = async () => {
  try {
    await redisClient.connect()
    console.log('Redis connection established successfully')
  } catch (error) {
    console.error('Unable to connect to Redis:', error)
    throw error
  }
}

redisClient.on('error', (err) => console.error('Redis Client Error', err))