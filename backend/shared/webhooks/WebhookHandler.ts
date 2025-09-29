import crypto from 'crypto'
import axios from 'axios'

export interface Webhook {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
}

export interface WebhookEvent {
  id: string
  type: string
  timestamp: string
  data: any
}

export class WebhookHandler {
  // Verify webhook signature
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return `sha256=${hash}` === signature
  }

  // Generate webhook signature
  static generateSignature(payload: string, secret: string): string {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return `sha256=${hash}`
  }

  // Send webhook event
  static async sendWebhook(webhook: Webhook, event: WebhookEvent): Promise<boolean> {
    if (!webhook.isActive) {
      return false
    }

    // Check if webhook subscribes to this event type
    if (!webhook.events.includes(event.type) && !webhook.events.includes('*')) {
      return false
    }

    const payload = JSON.stringify(event)
    const signature = this.generateSignature(payload, webhook.secret)

    try {
      const response = await axios.post(webhook.url, event, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Id': webhook.id,
          'X-Webhook-Timestamp': event.timestamp,
        },
        timeout: 5000, // 5 second timeout
      })

      return response.status >= 200 && response.status < 300
    } catch (error: any) {
      console.error(`Webhook delivery failed for ${webhook.url}:`, error.message)
      return false
    }
  }

  // Send webhook with retries
  static async sendWebhookWithRetries(
    webhook: Webhook,
    event: WebhookEvent,
    maxRetries: number = 3
  ): Promise<{ success: boolean; attempts: number }> {
    let attempts = 0

    for (let i = 0; i < maxRetries; i++) {
      attempts++
      const success = await this.sendWebhook(webhook, event)

      if (success) {
        return { success: true, attempts }
      }

      // Exponential backoff
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }

    return { success: false, attempts }
  }

  // Broadcast event to all webhooks
  static async broadcast(webhooks: Webhook[], event: WebhookEvent): Promise<void> {
    const promises = webhooks.map(webhook =>
      this.sendWebhookWithRetries(webhook, event)
    )

    await Promise.allSettled(promises)
  }
}

// Webhook event types
export const WebhookEvents = {
  // Campaign events
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_UPDATED: 'campaign.updated',
  CAMPAIGN_LAUNCHED: 'campaign.launched',
  CAMPAIGN_PAUSED: 'campaign.paused',
  CAMPAIGN_COMPLETED: 'campaign.completed',
  CAMPAIGN_DELETED: 'campaign.deleted',

  // Metrics events
  METRICS_UPDATED: 'metrics.updated',
  DAILY_REPORT_READY: 'report.daily.ready',

  // Integration events
  INTEGRATION_CONNECTED: 'integration.connected',
  INTEGRATION_DISCONNECTED: 'integration.disconnected',
  INTEGRATION_ERROR: 'integration.error',

  // Budget events
  BUDGET_WARNING: 'budget.warning',
  BUDGET_EXCEEDED: 'budget.exceeded',

  // Goal events
  GOAL_REACHED: 'goal.reached',
  GOAL_FAILED: 'goal.failed',
}