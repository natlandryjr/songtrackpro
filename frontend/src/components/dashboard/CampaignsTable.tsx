import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  budget: number
  spent: number
  streams: number
  startDate: string
  endDate: string
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Hits 2024',
    status: 'active',
    budget: 5000,
    spent: 3200,
    streams: 125000,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
  },
  {
    id: '2',
    name: 'New Release Promo',
    status: 'active',
    budget: 2500,
    spent: 2100,
    streams: 45000,
    startDate: '2024-07-15',
    endDate: '2024-08-15',
  },
  {
    id: '3',
    name: 'Album Launch',
    status: 'paused',
    budget: 10000,
    spent: 4500,
    streams: 89000,
    startDate: '2024-05-01',
    endDate: '2024-07-31',
  },
  {
    id: '4',
    name: 'Festival Tour',
    status: 'completed',
    budget: 7500,
    spent: 7500,
    streams: 320000,
    startDate: '2024-04-01',
    endDate: '2024-06-30',
  },
  {
    id: '5',
    name: 'Holiday Special',
    status: 'draft',
    budget: 3000,
    spent: 0,
    streams: 0,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
  },
]

const statusVariants = {
  active: 'success' as const,
  paused: 'warning' as const,
  completed: 'default' as const,
  draft: 'info' as const,
}

export default function CampaignsTable() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.round((spent / budget) * 100)
  }

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Campaigns</CardTitle>
          <button className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-400">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-400">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-400">
                  Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-400">
                  Streams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-400">
                  Period
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockCampaigns.map(campaign => {
                const progress = getProgressPercentage(campaign.spent, campaign.budget)
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatCurrency(campaign.budget)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(campaign.spent)}</div>
                      <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          )}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {campaign.streams.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{formatDate(campaign.startDate)}</div>
                      <div className="text-xs text-gray-500">to {formatDate(campaign.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === campaign.id ? null : campaign.id)}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                        {activeMenu === campaign.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-10">
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                              <Edit className="h-4 w-4" />
                              Edit Campaign
                            </button>
                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}