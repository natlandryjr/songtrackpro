import { Plus, TrendingUp, Music, Download } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  action: () => void
}

export default function QuickActions() {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const actions: QuickAction[] = [
    {
      id: 'create-campaign',
      title: 'Create Campaign',
      description: 'Launch a new Meta Ads campaign',
      icon: Plus,
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/app/campaigns'),
    },
    {
      id: 'connect-meta',
      title: 'Connect Meta Ads',
      description: 'Link your Facebook Ads account',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      action: () => console.log('Connect Meta Ads'),
    },
    {
      id: 'add-track',
      title: 'Add Track',
      description: 'Import a song from Spotify',
      icon: Music,
      color: 'from-green-500 to-emerald-500',
      action: () => console.log('Add Track'),
    },
    {
      id: 'export-report',
      title: 'Export Report',
      description: 'Download analytics data',
      icon: Download,
      color: 'from-orange-500 to-red-500',
      action: () => console.log('Export Report'),
    },
  ]

  return (
    <>
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {actions.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 text-left transition-all hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:hover:border-purple-600"
                >
                  <div className={`rounded-lg bg-gradient-to-br ${action.color} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{action.title}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Set up a new Meta Ads campaign for your music promotion.
            </p>

            <form className="mt-6 space-y-4">
              <div>
                <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign Name
                </label>
                <input
                  type="text"
                  id="campaign-name"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Summer Release 2024"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  id="budget"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="5000"
                />
              </div>

              <div>
                <label htmlFor="objective" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campaign Objective
                </label>
                <select
                  id="objective"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option>Increase Streams</option>
                  <option>Build Audience</option>
                  <option>Drive Traffic</option>
                  <option>Brand Awareness</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Create Campaign
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}