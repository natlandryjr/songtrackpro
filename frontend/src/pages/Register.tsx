import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Music, ArrowLeft } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })
      setAuth(response.user, response.tokens)
      navigate('/app')
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Music className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white">Create Account</h1>
            <p className="text-gray-400">Start your 14-day free trial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}