import { LucideIcon } from 'lucide-react'
import Card, { CardContent } from '@/components/ui/Card'
import { cn, formatCurrency, formatNumber } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  iconColor?: string
  format?: 'number' | 'currency' | 'percentage'
}

export default function MetricCard({ title, value, change, icon: Icon, iconColor, format = 'number' }: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val}%`
      case 'number':
      default:
        return formatNumber(val)
    }
  }

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <Card variant="bordered" className="hover:shadow-lg transition-shadow">
      <CardContent className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatValue(value)}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive && 'text-green-600 dark:text-green-400',
                  isNegative && 'text-red-600 dark:text-red-400',
                  !isPositive && !isNegative && 'text-gray-600 dark:text-gray-400'
                )}
              >
                {isPositive && '↑'} {isNegative && '↓'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconColor || 'bg-purple-100 dark:bg-purple-900/30')}>
          <Icon className={cn('h-8 w-8', iconColor ? 'text-current' : 'text-purple-600 dark:text-purple-400')} />
        </div>
      </CardContent>
    </Card>
  )
}