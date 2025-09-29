import { DollarSign, TrendingUp, Music, Users } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import CampaignsTable from '@/components/dashboard/CampaignsTable'
import QuickActions from '@/components/dashboard/QuickActions'
import { useRealtimeNotifications } from '@/contexts/NotificationsContext'

export default function Dashboard() {
  // Enable real-time notifications
  useRealtimeNotifications()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your campaigns and performance metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Spend"
          value={12750}
          change={15.3}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Streams"
          value={579000}
          change={23.1}
          icon={Music}
          format="number"
        />
        <MetricCard
          title="Active Campaigns"
          value="8"
          change={-12.5}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Reach"
          value={1240000}
          change={8.7}
          icon={Users}
          format="number"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Campaigns Table */}
      <CampaignsTable />
    </div>
  )
}