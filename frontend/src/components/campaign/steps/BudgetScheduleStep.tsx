import { useState } from 'react'
import { DollarSign, Calendar, TrendingUp, Info } from 'lucide-react'
import { useCampaignWizard } from '@/contexts/CampaignWizardContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { cn, formatCurrency } from '@/lib/utils'

const bidStrategyOptions = [
  {
    value: 'lowest_cost',
    label: 'Lowest Cost',
    description: 'Get the most results for your budget',
    recommended: true,
  },
  {
    value: 'cost_cap',
    label: 'Cost Cap',
    description: 'Control average cost per result',
    recommended: false,
  },
  {
    value: 'bid_cap',
    label: 'Bid Cap',
    description: 'Control maximum bid in auctions',
    recommended: false,
  },
]

const optimizationGoals = [
  { value: 'link_clicks', label: 'Link Clicks', icon: '🔗' },
  { value: 'impressions', label: 'Impressions', icon: '👁️' },
  { value: 'reach', label: 'Reach', icon: '📊' },
  { value: 'conversions', label: 'Conversions', icon: '✅' },
]

export default function BudgetScheduleStep() {
  const { campaignData, updateCampaignData } = useCampaignWizard()

  const [budget, setBudget] = useState({
    totalBudget: campaignData.budget?.totalBudget || 0,
    dailyBudget: campaignData.budget?.dailyBudget || 0,
    startDate: campaignData.budget?.startDate || '',
    endDate: campaignData.budget?.endDate || '',
    bidStrategy: campaignData.budget?.bidStrategy || 'lowest_cost',
    bidAmount: campaignData.budget?.bidAmount,
    optimization: campaignData.budget?.optimization || 'link_clicks',
  })

  const handleBudgetUpdate = (updates: Partial<typeof budget>) => {
    const updated = { ...budget, ...updates }
    setBudget(updated)
    updateCampaignData({ budget: updated })
  }

  const calculateDailyBudget = (total: number, start: string, end: string) => {
    if (!start || !end || total === 0) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? total / days : 0
  }

  const handleTotalBudgetChange = (value: number) => {
    const daily = calculateDailyBudget(value, budget.startDate, budget.endDate)
    handleBudgetUpdate({ totalBudget: value, dailyBudget: daily })
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updates = { [field]: value }
    if (budget.startDate && budget.endDate && budget.totalBudget) {
      const start = field === 'startDate' ? value : budget.startDate
      const end = field === 'endDate' ? value : budget.endDate
      const daily = calculateDailyBudget(budget.totalBudget, start, end)
      updates.dailyBudget = daily
    }
    handleBudgetUpdate(updates)
  }

  const campaignDuration = budget.startDate && budget.endDate
    ? Math.ceil((new Date(budget.endDate).getTime() - new Date(budget.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const estimatedReach = budget.totalBudget * 500 // Simplified calculation
  const estimatedClicks = Math.floor(budget.totalBudget / 0.5) // Assuming $0.50 CPC

  return (
    <div className="space-y-6">
      {/* Budget Allocation */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <CardTitle>Budget Allocation *</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Budget (USD) *
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="number"
                min="10"
                step="10"
                placeholder="1000"
                value={budget.totalBudget || ''}
                onChange={e => handleTotalBudgetChange(parseFloat(e.target.value) || 0)}
              />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Minimum: $10</span>
                <span className="text-sm text-gray-500">Recommended: $500+</span>
              </div>
            </div>
          </div>

          {budget.dailyBudget > 0 && (
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Daily Budget: {formatCurrency(budget.dailyBudget)}
                  </p>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                    Based on your campaign duration, we'll spend approximately this amount per day
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Budget Recommendations */}
          <div className="grid grid-cols-3 gap-3">
            {[500, 1000, 2500].map(amount => (
              <button
                key={amount}
                onClick={() => handleTotalBudgetChange(amount)}
                className={cn(
                  'rounded-lg border-2 p-3 text-center transition-all',
                  budget.totalBudget === amount
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-600'
                )}
              >
                <p className="text-lg font-bold text-gray-900 dark:text-white">${amount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {amount === 500 ? 'Starter' : amount === 1000 ? 'Popular' : 'Premium'}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Schedule */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <CardTitle>Campaign Schedule *</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date *
              </label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={budget.startDate}
                onChange={e => handleDateChange('startDate', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date *
              </label>
              <Input
                type="date"
                min={budget.startDate || new Date().toISOString().split('T')[0]}
                value={budget.endDate}
                onChange={e => handleDateChange('endDate', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {campaignDuration > 0 && (
            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                Campaign Duration: {campaignDuration} days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bid Strategy */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle>Bid Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {bidStrategyOptions.map(strategy => (
              <button
                key={strategy.value}
                onClick={() => handleBudgetUpdate({ bidStrategy: strategy.value as any })}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all',
                  budget.bidStrategy === strategy.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                )}
              >
                <input
                  type="radio"
                  checked={budget.bidStrategy === strategy.value}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 text-purple-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{strategy.label}</span>
                    {strategy.recommended && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{strategy.description}</p>
                </div>
              </button>
            ))}
          </div>

          {(budget.bidStrategy === 'cost_cap' || budget.bidStrategy === 'bid_cap') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {budget.bidStrategy === 'cost_cap' ? 'Cost Cap' : 'Bid Cap'} Amount (USD)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="1.00"
                value={budget.bidAmount || ''}
                onChange={e => handleBudgetUpdate({ bidAmount: parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Goal */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Optimization Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {optimizationGoals.map(goal => (
              <button
                key={goal.value}
                onClick={() => handleBudgetUpdate({ optimization: goal.value as any })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  budget.optimization === goal.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                )}
              >
                <span className="text-2xl">{goal.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{goal.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary */}
      {budget.totalBudget > 0 && campaignDuration > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Reach</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {estimatedReach.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Clicks</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {estimatedClicks.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily Spend</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(budget.dailyBudget || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}