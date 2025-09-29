import { RateLimitInfo } from '../types/metaApi'

export interface RateLimitConfig {
  // Meta Marketing API rate limits
  callsPerHour: number
  cpuTimePerHour: number // in seconds
  totalTimePerHour: number // in seconds

  // Warning thresholds (percentage)
  warningThreshold: number
  criticalThreshold: number

  // Buffer before hitting limits
  bufferPercentage: number
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  callsPerHour: 200, // Default for Ads Management API
  cpuTimePerHour: 60 * 60, // 1 hour of CPU time
  totalTimePerHour: 60 * 60, // 1 hour of total time

  warningThreshold: 75, // Warn at 75%
  criticalThreshold: 90, // Critical at 90%
  bufferPercentage: 10, // Keep 10% buffer
}

interface RateLimitWindow {
  startTime: number
  callCount: number
  totalCpuTime: number
  totalTime: number
}

export class RateLimiter {
  private config: RateLimitConfig
  private windows: Map<string, RateLimitWindow> = new Map()
  private windowDurationMs = 60 * 60 * 1000 // 1 hour
  private onWarning?: (info: RateLimitInfo) => void
  private onCritical?: (info: RateLimitInfo) => void
  private onLimitReached?: (info: RateLimitInfo) => void

  constructor(
    config: Partial<RateLimitConfig> = {},
    callbacks?: {
      onWarning?: (info: RateLimitInfo) => void
      onCritical?: (info: RateLimitInfo) => void
      onLimitReached?: (info: RateLimitInfo) => void
    }
  ) {
    this.config = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config }
    this.onWarning = callbacks?.onWarning
    this.onCritical = callbacks?.onCritical
    this.onLimitReached = callbacks?.onLimitReached
  }

  /**
   * Check if we can make a call without hitting rate limits
   */
  async checkLimit(accountId: string = 'default'): Promise<boolean> {
    const window = this.getOrCreateWindow(accountId)
    this.cleanupOldWindows()

    const usage = this.calculateUsagePercentage(window)

    // Check if we're at or above critical threshold
    if (usage.maxPercentage >= 100 - this.config.bufferPercentage) {
      const info = this.createRateLimitInfo(window, usage)

      if (this.onLimitReached) {
        this.onLimitReached(info)
      }

      // Calculate estimated time to regain access
      const timeToRegain = this.windowDurationMs - (Date.now() - window.startTime)
      console.warn(
        `Rate limit reached for account ${accountId}. ` +
        `Estimated time to regain access: ${Math.ceil(timeToRegain / 60000)} minutes`
      )

      return false
    }

    // Trigger warnings
    if (usage.maxPercentage >= this.config.criticalThreshold && this.onCritical) {
      this.onCritical(this.createRateLimitInfo(window, usage))
    } else if (usage.maxPercentage >= this.config.warningThreshold && this.onWarning) {
      this.onWarning(this.createRateLimitInfo(window, usage))
    }

    return true
  }

  /**
   * Record an API call
   */
  async recordCall(
    cpuTime: number = 0,
    totalTime: number = 0,
    accountId: string = 'default'
  ): Promise<void> {
    const window = this.getOrCreateWindow(accountId)

    window.callCount++
    window.totalCpuTime += cpuTime
    window.totalTime += totalTime

    this.windows.set(accountId, window)
  }

  /**
   * Get current usage for an account
   */
  getUsage(accountId: string = 'default'): RateLimitInfo {
    const window = this.getOrCreateWindow(accountId)
    const usage = this.calculateUsagePercentage(window)

    return this.createRateLimitInfo(window, usage)
  }

  /**
   * Get all account usages
   */
  getAllUsages(): Map<string, RateLimitInfo> {
    const usages = new Map<string, RateLimitInfo>()

    for (const [accountId, window] of this.windows.entries()) {
      const usage = this.calculateUsagePercentage(window)
      usages.set(accountId, this.createRateLimitInfo(window, usage))
    }

    return usages
  }

  /**
   * Reset rate limits for an account
   */
  reset(accountId: string = 'default'): void {
    this.windows.delete(accountId)
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.windows.clear()
  }

  /**
   * Calculate estimated wait time before next call can be made
   */
  getEstimatedWaitTime(accountId: string = 'default'): number {
    const window = this.getOrCreateWindow(accountId)
    const usage = this.calculateUsagePercentage(window)

    // If we're not at limit, no wait time
    if (usage.maxPercentage < 100 - this.config.bufferPercentage) {
      return 0
    }

    // Calculate time until window resets
    const windowAge = Date.now() - window.startTime
    const timeUntilReset = this.windowDurationMs - windowAge

    return Math.max(0, timeUntilReset)
  }

  /**
   * Wait until rate limit allows next call
   */
  async waitForLimit(accountId: string = 'default'): Promise<void> {
    const waitTime = this.getEstimatedWaitTime(accountId)

    if (waitTime > 0) {
      console.log(`Rate limit: Waiting ${Math.ceil(waitTime / 1000)} seconds for account ${accountId}`)
      await this.sleep(waitTime)
    }
  }

  /**
   * Execute function with automatic rate limit waiting
   */
  async executeWithRateLimit<T>(
    fn: () => Promise<T>,
    accountId: string = 'default'
  ): Promise<T> {
    const canProceed = await this.checkLimit(accountId)

    if (!canProceed) {
      await this.waitForLimit(accountId)
    }

    return fn()
  }

  /**
   * Get or create window for account
   */
  private getOrCreateWindow(accountId: string): RateLimitWindow {
    let window = this.windows.get(accountId)

    if (!window || this.isWindowExpired(window)) {
      window = {
        startTime: Date.now(),
        callCount: 0,
        totalCpuTime: 0,
        totalTime: 0,
      }
      this.windows.set(accountId, window)
    }

    return window
  }

  /**
   * Check if window has expired
   */
  private isWindowExpired(window: RateLimitWindow): boolean {
    return Date.now() - window.startTime > this.windowDurationMs
  }

  /**
   * Clean up expired windows
   */
  private cleanupOldWindows(): void {
    const now = Date.now()

    for (const [accountId, window] of this.windows.entries()) {
      if (now - window.startTime > this.windowDurationMs) {
        this.windows.delete(accountId)
      }
    }
  }

  /**
   * Calculate usage percentage for all metrics
   */
  private calculateUsagePercentage(window: RateLimitWindow): {
    callsPercentage: number
    cpuTimePercentage: number
    totalTimePercentage: number
    maxPercentage: number
  } {
    const callsPercentage = (window.callCount / this.config.callsPerHour) * 100
    const cpuTimePercentage = (window.totalCpuTime / this.config.cpuTimePerHour) * 100
    const totalTimePercentage = (window.totalTime / this.config.totalTimePerHour) * 100

    return {
      callsPercentage,
      cpuTimePercentage,
      totalTimePercentage,
      maxPercentage: Math.max(callsPercentage, cpuTimePercentage, totalTimePercentage),
    }
  }

  /**
   * Create RateLimitInfo object
   */
  private createRateLimitInfo(
    window: RateLimitWindow,
    usage: {
      callsPercentage: number
      cpuTimePercentage: number
      totalTimePercentage: number
      maxPercentage: number
    }
  ): RateLimitInfo {
    const timeToRegain =
      usage.maxPercentage >= 100 - this.config.bufferPercentage
        ? this.windowDurationMs - (Date.now() - window.startTime)
        : undefined

    return {
      call_count: window.callCount,
      total_cputime: window.totalCpuTime,
      total_time: window.totalTime,
      type: 'ads_management',
      app_id_util_pct: usage.maxPercentage,
      estimated_time_to_regain_access: timeToRegain ? Math.ceil(timeToRegain / 60000) : undefined,
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config }
  }

  /**
   * Import rate limit data from Meta API response headers
   */
  importFromMetaHeaders(headers: any, accountId: string = 'default'): void {
    const usage = headers['x-business-use-case-usage']
    if (!usage) return

    try {
      const usageData = JSON.parse(usage)
      const accountData = usageData[accountId]?.[0]

      if (accountData) {
        const window = this.getOrCreateWindow(accountId)
        window.callCount = accountData.call_count || window.callCount
        window.totalCpuTime = accountData.total_cputime || window.totalCpuTime
        window.totalTime = accountData.total_time || window.totalTime
        this.windows.set(accountId, window)
      }
    } catch (error) {
      console.error('Failed to import rate limit data from Meta headers:', error)
    }
  }
}

// Export singleton instance with default config
export const defaultRateLimiter = new RateLimiter()