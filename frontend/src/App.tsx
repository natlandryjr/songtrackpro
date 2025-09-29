import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import Layout from '@/components/layout/Layout'
import LandingPage from '@/pages/LandingPage'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import MetaAds from '@/pages/MetaAds'
import SpotifyAnalytics from '@/pages/SpotifyAnalytics'
import Campaigns from '@/pages/Campaigns'
import Settings from '@/pages/Settings'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ThemeProvider>
      <NotificationsProvider>
        <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/app"
        element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="meta-ads" element={<MetaAds />} />
        <Route path="spotify" element={<SpotifyAnalytics />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </NotificationsProvider>
    </ThemeProvider>
  )
}

export default App