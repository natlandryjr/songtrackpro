import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import Button from '@/components/ui/Button'
import CampaignsTable from '@/components/dashboard/CampaignsTable'
import CampaignWizard from '@/components/campaign/CampaignWizard'
import { CampaignWizardProvider } from '@/contexts/CampaignWizardContext'

export default function Campaigns() {
  const [showWizard, setShowWizard] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your Meta Ads campaigns and track their performance
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowWizard(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Paused</option>
          <option>Completed</option>
          <option>Draft</option>
        </select>
        <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
          <option>All time</option>
        </select>
      </div>

      {/* Campaigns Table */}
      <CampaignsTable />

      {/* Campaign Wizard */}
      {showWizard && (
        <CampaignWizardProvider>
          <CampaignWizard onClose={() => setShowWizard(false)} />
        </CampaignWizardProvider>
      )}
    </div>
  )
}