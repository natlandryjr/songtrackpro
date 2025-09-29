import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Music, Settings, Target } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Campaigns', to: '/campaigns', icon: Target },
  { name: 'Meta Ads', to: '/meta-ads', icon: TrendingUp },
  { name: 'Spotify', to: '/spotify', icon: Music },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-primary-600">SongTrackPro</h1>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}