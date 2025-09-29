import { useState } from 'react'
import { TrendingUp, DollarSign, MousePointer, Eye, Download } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import PerformanceChart from '@/components/analytics/PerformanceChart'
import DateRangePicker from '@/components/analytics/DateRangePicker'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

// Mock data generator
const generateMockData = () => {
  const labels = []
  const impressions = []
  const clicks = []
  const conversions = []
  const spend = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    impressions.push(Math.floor(Math.random() * 50000) + 30000)
    clicks.push(Math.floor(Math.random() * 2000) + 500)
    conversions.push(Math.floor(Math.random() * 200) + 50)
    spend.push(Math.floor(Math.random() * 500) + 100)
  }

  return { labels, impressions, clicks, conversions, spend }
}

const mockData = generateMockData()

const performanceOverTimeData = {
  labels: mockData.labels,
  datasets: [
    {
      label: 'Impressions',
      data: mockData.impressions,
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true,
    },
    {
      label: 'Clicks',
      data: mockData.clicks,
      borderColor: 'rgb(236, 72, 153)',
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      fill: true,
    },
  ],
}

const conversionData = {
  labels: mockData.labels,
  datasets: [
    {
      label: 'Conversions',
      data: mockData.conversions,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
    },
  ],
}

const spendData = {
  labels: mockData.labels,
  datasets: [
    {
      label: 'Daily Spend ($)',
      data: mockData.spend,
      borderColor: 'rgb(249, 115, 22)',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      fill: true,
    },
  ],
}

export default function MetaAds() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const totalImpressions = mockData.impressions.reduce((a, b) => a + b, 0)
  const totalClicks = mockData.clicks.reduce((a, b) => a + b, 0)
  const totalConversions = mockData.conversions.reduce((a, b) => a + b, 0)
  const totalSpend = mockData.spend.reduce((a, b) => a + b, 0)
  const avgCTR = ((totalClicks / totalImpressions) * 100).toFixed(2)
  const avgCPC = (totalSpend / totalClicks).toFixed(2)
  const costPerConversion = (totalSpend / totalConversions).toFixed(2)
  const roi = (((totalConversions * 15 - totalSpend) / totalSpend) * 100).toFixed(1)

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Impressions', 'Clicks', 'Conversions', 'Spend'],
      ...mockData.labels.map((label, i) => [
        label,
        mockData.impressions[i],
        mockData.clicks[i],
        mockData.conversions[i],
        mockData.spend[i],
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meta-ads-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meta Ads Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track your Facebook & Instagram ad performance</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <DateRangePicker onDateChange={(start, end) => setDateRange({ start, end })} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Impressions" value={totalImpressions} change={12.3} icon={Eye} format="number" />
        <MetricCard title="Total Clicks" value={totalClicks} change={8.7} icon={MousePointer} format="number" />
        <MetricCard title="Conversions" value={totalConversions} change={15.2} icon={TrendingUp} format="number" />
        <MetricCard title="Total Spend" value={totalSpend} change={-3.1} icon={DollarSign} format="currency" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card variant="bordered">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Click-Through Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{avgCTR}%</p>
              <p className="mt-1 text-xs text-gray-500">Industry avg: 1.91%</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost Per Click</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${avgCPC}</p>
              <p className="mt-1 text-xs text-gray-500">Industry avg: $1.72</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost Per Conversion</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${costPerConversion}</p>
              <p className="mt-1 text-xs text-gray-500">Target: $15.00</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ROI</p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{roi}%</p>
              <p className="mt-1 text-xs text-gray-500">Return on ad spend</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PerformanceChart title="Impressions & Clicks Over Time" data={performanceOverTimeData} />
        <PerformanceChart title="Conversions Over Time" data={conversionData} />
      </div>

      <PerformanceChart title="Daily Ad Spend" data={spendData} height={250} />

      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-400">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-400">Impressions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-400">Clicks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-400">CTR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-400">Conversions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-400">Spend</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-400">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { name: 'Summer Hits 2024', impressions: 450000, clicks: 12500, conversions: 890, spend: 3200 },
                  { name: 'New Release Promo', impressions: 320000, clicks: 8900, conversions: 650, spend: 2100 },
                  { name: 'Album Launch', impressions: 280000, clicks: 7200, conversions: 510, spend: 1800 },
                ].map(campaign => {
                  const ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
                  const campaignRoi = (((campaign.conversions * 15 - campaign.spend) / campaign.spend) * 100).toFixed(1)
                  return (
                    <tr key={campaign.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{campaign.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{campaign.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ctr}%</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{campaign.conversions}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{formatCurrency(campaign.spend)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">{campaignRoi}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}