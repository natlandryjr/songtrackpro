import { useAuthStore } from '@/store/authStore'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function Header() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {user?.name}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-700">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}