/**
 * In-memory cache service with TTL support
 * For production, consider using Redis or Memcached
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export class InMemoryCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private defaultTTL: number
  private maxSize: number

  constructor(config?: {
    defaultTTL?: number // in seconds
    maxSize?: number
    cleanupIntervalMs?: number
  }) {
    this.defaultTTL = config?.defaultTTL || 3600 // 1 hour default
    this.maxSize = config?.maxSize || 1000
    const cleanupIntervalMs = config?.cleanupIntervalMs || 60000 // 1 minute

    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // Enforce max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove oldest entry (first entry in Map)
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const ttl = ttlSeconds !== undefined ? ttlSeconds : this.defaultTTL
    const expiresAt = Date.now() + ttl * 1000

    this.cache.set(key, {
      value,
      expiresAt,
    })
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Get all keys in cache
   */
  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    keys: string[]
    oldestEntry?: { key: string; age: number }
    newestEntry?: { key: string; age: number }
  } {
    const keys = Array.from(this.cache.keys())
    const now = Date.now()

    let oldestEntry: { key: string; age: number } | undefined
    let newestEntry: { key: string; age: number } | undefined

    for (const [key, entry] of this.cache.entries()) {
      const age = now - (entry.expiresAt - this.defaultTTL * 1000)

      if (!oldestEntry || age > oldestEntry.age) {
        oldestEntry = { key, age }
      }

      if (!newestEntry || age < newestEntry.age) {
        newestEntry = { key, age }
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys,
      oldestEntry,
      newestEntry,
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }

    if (keysToDelete.length > 0) {
      console.debug(`Cache cleanup: removed ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }

  /**
   * Get or set pattern
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  /**
   * Set multiple values at once
   */
  async setMany<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl)
    }
  }

  /**
   * Get multiple values at once
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>()

    for (const key of keys) {
      const value = await this.get<T>(key)
      if (value !== null) {
        result.set(key, value)
      }
    }

    return result
  }

  /**
   * Delete multiple keys at once
   */
  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key)
    }
  }

  /**
   * Delete keys by pattern (simple prefix matching)
   */
  async deletePattern(pattern: string): Promise<number> {
    const keys = Array.from(this.cache.keys())
    const matchingKeys = keys.filter(key => {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1)
        return key.startsWith(prefix)
      }
      return key === pattern
    })

    await this.deleteMany(matchingKeys)
    return matchingKeys.length
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1, ttlSeconds?: number): Promise<number> {
    const current = await this.get<number>(key)
    const newValue = (current || 0) + amount
    await this.set(key, newValue, ttlSeconds)
    return newValue
  }

  /**
   * Decrement a numeric value
   */
  async decrement(key: string, amount: number = 1, ttlSeconds?: number): Promise<number> {
    return this.increment(key, -amount, ttlSeconds)
  }
}

/**
 * Redis-compatible cache service interface
 * Use this for production with actual Redis client
 */
export class RedisCacheService {
  private client: any // Redis client instance

  constructor(redisClient: any) {
    this.client = redisClient
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized)
      } else {
        await this.client.set(key, serialized)
      }
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key)
      return exists === 1
    } catch (error) {
      console.error('Redis has error:', error)
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb()
    } catch (error) {
      console.error('Redis clear error:', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      return await this.client.keys('*')
    } catch (error) {
      console.error('Redis keys error:', error)
      return []
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
      return keys.length
    } catch (error) {
      console.error('Redis deletePattern error:', error)
      return 0
    }
  }

  async increment(key: string, amount: number = 1, ttlSeconds?: number): Promise<number> {
    try {
      const newValue = await this.client.incrby(key, amount)
      if (ttlSeconds) {
        await this.client.expire(key, ttlSeconds)
      }
      return newValue
    } catch (error) {
      console.error('Redis increment error:', error)
      return 0
    }
  }
}

// Export default in-memory cache instance
export const defaultCacheService = new InMemoryCacheService({
  defaultTTL: 3600, // 1 hour
  maxSize: 1000,
  cleanupIntervalMs: 60000, // 1 minute
})