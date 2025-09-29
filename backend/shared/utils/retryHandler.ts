import { MetaApiError } from '../types/metaApi'

export interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableStatusCodes: number[]
  retryableErrorCodes: number[]
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorCodes: [
    1, // API Unknown Error
    2, // API Service Error
    4, // API Too Many Calls
    17, // API User Too Many Calls
    32, // API User Request Limit Reached
    80004, // Temporary network error
    190, // Access token expired (should refresh)
  ],
}

export class RetryHandler {
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options?: {
      retryCount?: number
      context?: string
      onRetry?: (attempt: number, error: any) => void
    }
  ): Promise<T> {
    const retryCount = options?.retryCount || 0
    const context = options?.context || 'Operation'

    try {
      return await fn()
    } catch (error: any) {
      // Check if we should retry
      const shouldRetry = this.shouldRetryError(error)
      const hasRetriesLeft = retryCount < this.config.maxRetries

      if (!shouldRetry || !hasRetriesLeft) {
        console.error(`${context} failed after ${retryCount} retries:`, error)
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = this.calculateDelay(retryCount)

      console.warn(
        `${context} failed (attempt ${retryCount + 1}/${this.config.maxRetries}). ` +
        `Retrying in ${delay}ms...`,
        this.getErrorDetails(error)
      )

      // Call onRetry callback if provided
      if (options?.onRetry) {
        options.onRetry(retryCount + 1, error)
      }

      // Wait before retrying
      await this.sleep(delay)

      // Retry with incremented count
      return this.executeWithRetry(fn, {
        ...options,
        retryCount: retryCount + 1,
      })
    }
  }

  /**
   * Determine if an error should be retried
   */
  private shouldRetryError(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true
    }

    // Axios errors
    if (error.response) {
      const statusCode = error.response.status

      // Check if status code is retryable
      if (this.config.retryableStatusCodes.includes(statusCode)) {
        return true
      }

      // Check Meta API error codes
      const metaError = error.response.data as MetaApiError
      if (metaError?.error?.code) {
        return this.config.retryableErrorCodes.includes(metaError.error.code)
      }
    }

    return false
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(retryCount: number): number {
    // Exponential backoff: initialDelay * (backoffMultiplier ^ retryCount)
    const exponentialDelay =
      this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, retryCount)

    // Cap at max delay
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelayMs)

    // Add jitter (±20% randomness) to avoid thundering herd
    const jitter = cappedDelay * 0.2 * (Math.random() * 2 - 1)

    return Math.floor(cappedDelay + jitter)
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Extract error details for logging
   */
  private getErrorDetails(error: any): any {
    if (error.response?.data) {
      const metaError = error.response.data as MetaApiError
      if (metaError?.error) {
        return {
          code: metaError.error.code,
          type: metaError.error.type,
          message: metaError.error.message,
          subcode: metaError.error.error_subcode,
          trace_id: metaError.error.fbtrace_id,
        }
      }
    }

    return {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    }
  }

  /**
   * Check if error is rate limit error
   */
  isRateLimitError(error: any): boolean {
    if (error.response?.status === 429) {
      return true
    }

    if (error.response?.data) {
      const metaError = error.response.data as MetaApiError
      if (metaError?.error) {
        return [4, 17, 32, 613].includes(metaError.error.code)
      }
    }

    return false
  }

  /**
   * Get retry-after delay from error response
   */
  getRetryAfterDelay(error: any): number | null {
    // Check Retry-After header
    const retryAfter = error.response?.headers['retry-after']
    if (retryAfter) {
      // Retry-After can be in seconds or HTTP date
      const seconds = parseInt(retryAfter, 10)
      if (!isNaN(seconds)) {
        return seconds * 1000 // Convert to milliseconds
      }
    }

    // Check Meta API error for estimated time
    if (error.response?.data) {
      const metaError = error.response.data as MetaApiError
      if (metaError?.error?.error_user_msg) {
        // Try to parse estimated time from error message
        const match = metaError.error.error_user_msg.match(/(\d+)\s*minutes?/)
        if (match) {
          return parseInt(match[1], 10) * 60 * 1000
        }
      }
    }

    return null
  }

  /**
   * Execute with specific retry logic for rate limit errors
   */
  async executeWithRateLimitRetry<T>(
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number
      context?: string
      onRateLimit?: (waitTime: number) => void
    }
  ): Promise<T> {
    const maxRetries = options?.maxRetries || 5
    let retryCount = 0

    while (retryCount <= maxRetries) {
      try {
        return await fn()
      } catch (error: any) {
        if (!this.isRateLimitError(error)) {
          throw error
        }

        if (retryCount >= maxRetries) {
          console.error(`Rate limit retry exhausted after ${maxRetries} attempts`)
          throw error
        }

        // Get retry delay from response or use exponential backoff
        const retryAfter = this.getRetryAfterDelay(error)
        const delay = retryAfter || this.calculateDelay(retryCount)

        console.warn(
          `Rate limit hit (attempt ${retryCount + 1}/${maxRetries}). ` +
          `Waiting ${delay}ms before retry...`
        )

        if (options?.onRateLimit) {
          options.onRateLimit(delay)
        }

        await this.sleep(delay)
        retryCount++
      }
    }

    throw new Error('Rate limit retry logic failed unexpectedly')
  }

  /**
   * Execute batch operations with automatic retry and delay between batches
   */
  async executeBatchWithRetry<T, R>(
    items: T[],
    batchSize: number,
    processBatch: (batch: T[]) => Promise<R[]>,
    options?: {
      delayBetweenBatches?: number
      context?: string
      onBatchComplete?: (batchNumber: number, totalBatches: number, results: R[]) => void
      onError?: (batchNumber: number, error: any) => void
    }
  ): Promise<R[]> {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    const results: R[] = []
    const totalBatches = batches.length
    const context = options?.context || 'Batch operation'

    for (let i = 0; i < batches.length; i++) {
      const batchNumber = i + 1

      try {
        console.log(`${context}: Processing batch ${batchNumber}/${totalBatches}`)

        const batchResults = await this.executeWithRetry(
          () => processBatch(batches[i]),
          {
            context: `${context} (batch ${batchNumber}/${totalBatches})`,
          }
        )

        results.push(...batchResults)

        if (options?.onBatchComplete) {
          options.onBatchComplete(batchNumber, totalBatches, batchResults)
        }

        // Delay between batches (except after last batch)
        if (i < batches.length - 1 && options?.delayBetweenBatches) {
          await this.sleep(options.delayBetweenBatches)
        }
      } catch (error) {
        console.error(`${context}: Batch ${batchNumber}/${totalBatches} failed:`, error)

        if (options?.onError) {
          options.onError(batchNumber, error)
        } else {
          throw error
        }
      }
    }

    return results
  }
}

// Export singleton instance with default config
export const defaultRetryHandler = new RetryHandler()