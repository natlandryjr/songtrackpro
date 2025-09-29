export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  metadata?: any
  error?: {
    message: string
    stack?: string
    code?: string | number
  }
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  prettyPrint: boolean
  includeTimestamp: boolean
  includeContext: boolean
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  prettyPrint: true,
  includeTimestamp: true,
  includeContext: true,
}

export class Logger {
  private config: LoggerConfig
  private context?: string
  private logHandlers: Array<(entry: LogEntry) => void> = []

  constructor(context?: string, config: Partial<LoggerConfig> = {}) {
    this.context = context
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Add custom log handler
   */
  addHandler(handler: (entry: LogEntry) => void): void {
    this.logHandlers.push(handler)
  }

  /**
   * Remove custom log handler
   */
  removeHandler(handler: (entry: LogEntry) => void): void {
    const index = this.logHandlers.indexOf(handler)
    if (index > -1) {
      this.logHandlers.splice(index, 1)
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, metadata)
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, metadata)
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, metadata)
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, metadata?: any): void {
    const errorInfo = error
      ? {
          message: error.message || String(error),
          stack: error.stack,
          code: error.code || error.response?.status,
        }
      : undefined

    this.log(LogLevel.ERROR, message, metadata, errorInfo)
  }

  /**
   * Fatal error level logging
   */
  fatal(message: string, error?: Error | any, metadata?: any): void {
    const errorInfo = error
      ? {
          message: error.message || String(error),
          stack: error.stack,
          code: error.code || error.response?.status,
        }
      : undefined

    this.log(LogLevel.FATAL, message, metadata, errorInfo)
  }

  /**
   * Log Meta API call
   */
  logApiCall(
    method: string,
    endpoint: string,
    duration: number,
    status: number,
    metadata?: any
  ): void {
    this.info(`API Call: ${method} ${endpoint}`, {
      method,
      endpoint,
      duration_ms: duration,
      status,
      ...metadata,
    })
  }

  /**
   * Log Meta API error
   */
  logApiError(
    method: string,
    endpoint: string,
    error: any,
    metadata?: any
  ): void {
    const errorDetails = this.extractApiErrorDetails(error)

    this.error(`API Error: ${method} ${endpoint}`, error, {
      method,
      endpoint,
      ...errorDetails,
      ...metadata,
    })
  }

  /**
   * Log rate limit warning
   */
  logRateLimitWarning(
    accountId: string,
    usagePercentage: number,
    metadata?: any
  ): void {
    this.warn(`Rate limit warning for account ${accountId}`, {
      account_id: accountId,
      usage_percentage: usagePercentage,
      ...metadata,
    })
  }

  /**
   * Log rate limit reached
   */
  logRateLimitReached(
    accountId: string,
    estimatedWaitTime: number,
    metadata?: any
  ): void {
    this.error(`Rate limit reached for account ${accountId}`, undefined, {
      account_id: accountId,
      estimated_wait_time_minutes: Math.ceil(estimatedWaitTime / 60000),
      ...metadata,
    })
  }

  /**
   * Log authentication event
   */
  logAuth(event: 'login' | 'logout' | 'token_refresh' | 'token_expired', userId: string, metadata?: any): void {
    this.info(`Auth: ${event}`, {
      event,
      user_id: userId,
      ...metadata,
    })
  }

  /**
   * Log campaign operation
   */
  logCampaignOperation(
    operation: 'create' | 'update' | 'delete' | 'activate' | 'pause',
    campaignId: string,
    metadata?: any
  ): void {
    this.info(`Campaign ${operation}`, {
      operation,
      campaign_id: campaignId,
      ...metadata,
    })
  }

  /**
   * Log conversion event
   */
  logConversion(
    eventName: string,
    pixelId: string,
    eventsCount: number,
    metadata?: any
  ): void {
    this.info(`Conversion event: ${eventName}`, {
      event_name: eventName,
      pixel_id: pixelId,
      events_count: eventsCount,
      ...metadata,
    })
  }

  /**
   * Log performance metrics
   */
  logMetrics(
    metricName: string,
    value: number,
    unit: string,
    metadata?: any
  ): void {
    this.debug(`Metric: ${metricName}`, {
      metric: metricName,
      value,
      unit,
      ...metadata,
    })
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: any,
    error?: LogEntry['error']
  ): void {
    // Skip if below configured level
    if (level < this.config.level) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      metadata,
      error,
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Custom handlers
    for (const handler of this.logHandlers) {
      try {
        handler(entry)
      } catch (error) {
        console.error('Log handler error:', error)
      }
    }
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level]
    const color = this.getLevelColor(entry.level)
    const reset = '\x1b[0m'

    if (this.config.prettyPrint) {
      const parts = []

      if (this.config.includeTimestamp) {
        parts.push(`\x1b[90m${entry.timestamp}${reset}`)
      }

      parts.push(`${color}${levelName}${reset}`)

      if (this.config.includeContext && entry.context) {
        parts.push(`\x1b[36m[${entry.context}]${reset}`)
      }

      parts.push(entry.message)

      const prefix = parts.join(' ')

      // Choose console method based on level
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(prefix, entry.metadata || '')
          break
        case LogLevel.INFO:
          console.info(prefix, entry.metadata || '')
          break
        case LogLevel.WARN:
          console.warn(prefix, entry.metadata || '')
          break
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(prefix, entry.metadata || '', entry.error || '')
          break
      }
    } else {
      // JSON format
      console.log(JSON.stringify(entry))
    }
  }

  /**
   * Get ANSI color code for log level
   */
  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[37m' // White
      case LogLevel.INFO:
        return '\x1b[32m' // Green
      case LogLevel.WARN:
        return '\x1b[33m' // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m' // Red
      case LogLevel.FATAL:
        return '\x1b[35m' // Magenta
      default:
        return '\x1b[0m' // Reset
    }
  }

  /**
   * Extract error details from Meta API error
   */
  private extractApiErrorDetails(error: any): any {
    if (error.response?.data?.error) {
      const metaError = error.response.data.error
      return {
        error_code: metaError.code,
        error_type: metaError.type,
        error_subcode: metaError.error_subcode,
        error_message: metaError.message,
        fbtrace_id: metaError.fbtrace_id,
        status: error.response.status,
      }
    }

    return {
      error_message: error.message,
      error_code: error.code,
      status: error.response?.status,
    }
  }

  /**
   * Create child logger with additional context
   */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context
    const childLogger = new Logger(childContext, this.config)
    childLogger.logHandlers = [...this.logHandlers]
    return childLogger
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config }
  }
}

/**
 * Create file log handler (requires fs module)
 */
export function createFileLogHandler(filePath: string): (entry: LogEntry) => void {
  const fs = require('fs')
  const path = require('path')

  // Ensure directory exists
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  return (entry: LogEntry) => {
    const line = JSON.stringify(entry) + '\n'
    fs.appendFileSync(filePath, line, 'utf8')
  }
}

/**
 * Create rotating file log handler
 */
export function createRotatingFileLogHandler(
  basePath: string,
  maxSizeMB: number = 10
): (entry: LogEntry) => void {
  const fs = require('fs')
  const path = require('path')

  let currentFile = basePath
  let currentSize = 0

  const checkRotation = () => {
    if (fs.existsSync(currentFile)) {
      const stats = fs.statSync(currentFile)
      currentSize = stats.size
      if (currentSize > maxSizeMB * 1024 * 1024) {
        // Rotate file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const ext = path.extname(basePath)
        const name = path.basename(basePath, ext)
        const dir = path.dirname(basePath)
        const rotatedFile = path.join(dir, `${name}-${timestamp}${ext}`)
        fs.renameSync(currentFile, rotatedFile)
        currentSize = 0
      }
    }
  }

  return (entry: LogEntry) => {
    checkRotation()
    const line = JSON.stringify(entry) + '\n'
    fs.appendFileSync(currentFile, line, 'utf8')
    currentSize += Buffer.byteLength(line)
  }
}

// Export default logger instance
export const defaultLogger = new Logger('SongTrackPro')

// Export legacy logger for backward compatibility
export const logger = {
  info: (message: string, meta?: any) => defaultLogger.info(message, meta),
  error: (message: string, error?: any) => defaultLogger.error(message, error),
  warn: (message: string, meta?: any) => defaultLogger.warn(message, meta),
  debug: (message: string, meta?: any) => defaultLogger.debug(message, meta),
}