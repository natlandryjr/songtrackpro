import { useState } from 'react'
import { Music, Users, Globe, TrendingUp, Download, Play } from 'lucide-react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import MetricCard from '@/components/dashboard/MetricCard'
import PerformanceChart from '@/components/analytics/PerformanceChart'
import DateRangePicker from '@/components/analytics/DateRangePicker'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const generateMockStreams = () => {
  const labels = []
  const streams = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    streams.push(Math.floor(Math.random() * 15000) + 8000)
  }
  return { labels, streams }
}

const mockData = generateMockStreams()

const streamsData = {
  labels: mockData.labels,
  datasets: [{
    label: 'Daily Streams',
    data: mockData.streams,
    borderColor: 'rgb(30, 215, 96)',
    backgroundColor: 'rgba(30, 215, 96, 0.1)',
    fill: true,
  }],
}

const demographicsData = {
  labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
  datasets: [{
    label: 'Listeners',
    data: [35, 28, 20, 12, 5],
    backgroundColor: [
      'rgba(147, 51, 234, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(249, 115, 22, 0.8)',
    ],
  }],
}

const geoData = {
  labels: ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia'],
  datasets: [{
    label: 'Streams by Country',
    data: [145000, 89000, 67000, 54000, 42000],
    backgroundColor: 'rgba(30, 215, 96, 0.6)',
  }],
}

export default function SpotifyAnalytics() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const totalStreams = mockData.streams.reduce((a, b) => a + b, 0)
  const totalListeners = Math.floor(totalStreams / 2.3)
  const avgStreamsPerListener = (totalStreams / totalListeners).toFixed(1)
  const saveRate = 12.4

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Streams'],
      ...mockData.labels.map((label, i) => [label, mockData.streams[i]]),
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spotify-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spotify Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Monitor your streaming performance and audience insights</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <DateRangePicker onDateChange={(start, end) => setDateRange({ start, end })} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Streams" value={totalStreams} change={18.5} icon={Play} format="number" />
        <MetricCard title="Unique Listeners" value={totalListeners} change={14.2} icon={Users} format="number" />
        <MetricCard title="Avg Streams/Listener" value={avgStreamsPerListener} change={3.1} icon={TrendingUp} />
        <MetricCard title="Save Rate" value={`${saveRate}%`} change={2.3} icon={Music} />
      </div>

      <PerformanceChart title="Streaming Performance Over Time" data={streamsData} height={350} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Listener Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Doughnut data={demographicsData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Bar data={geoData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Top Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Today\'s Top Hits', followers: '32.5M', streams: 89000, position: 12 },
                { name: 'RapCaviar', followers: '15.8M', streams: 67000, position: 8 },
                { name: 'Hot Country', followers: '8.2M', streams: 45000, position: 15 },
              ].map(playlist => (
                <div key={playlist.name} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{playlist.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{playlist.followers} followers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">{playlist.streams.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Position #{playlist.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Top Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: 'Summer Vibes', streams: 125000, saves: 8900, completion: 82 },
                { title: 'Midnight Dreams', streams: 98000, saves: 7200, completion: 78 },
                { title: 'City Lights', streams: 87000, saves: 6500, completion: 75 },
              ].map((track, i) => (
                <div key={track.title} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-green-100 dark:bg-green-900/30">
                    <span className="font-bold text-green-600 dark:text-green-400">#{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{track.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{track.streams.toLocaleString()} streams • {track.saves.toLocaleString()} saves</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{track.completion}%</p>
                    <p className="text-xs text-gray-500">completion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}