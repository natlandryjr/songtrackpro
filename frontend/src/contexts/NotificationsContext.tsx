import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

interface NotificationsContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { ...toast, id, duration: toast.duration || 5000 }
    setToasts(prev => [...prev, newToast])

    // Auto-remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  return (
    <NotificationsContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-600',
    success: 'bg-green-50 border-green-500 dark:bg-green-900/30 dark:border-green-600',
    warning: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-600',
    error: 'bg-red-50 border-red-500 dark:bg-red-900/30 dark:border-red-600',
  }

  const textStyles = {
    info: 'text-blue-900 dark:text-blue-200',
    success: 'text-green-900 dark:text-green-200',
    warning: 'text-yellow-900 dark:text-yellow-200',
    error: 'text-red-900 dark:text-red-200',
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-96">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'rounded-lg border-l-4 p-4 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-right',
            typeStyles[toast.type]
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn('font-semibold', textStyles[toast.type])}>{toast.title}</h4>
              <p className={cn('mt-1 text-sm', textStyles[toast.type])}>{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className={cn('rounded p-1 hover:bg-black/10 dark:hover:bg-white/10', textStyles[toast.type])}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Hook to simulate real-time notifications (for demo purposes)
export function useRealtimeNotifications() {
  const { addToast } = useNotifications()

  useEffect(() => {
    // Simulate receiving notifications at random intervals
    const notifications = [
      {
        title: 'Campaign Milestone',
        message: 'Your campaign reached 50K impressions!',
        type: 'success' as const,
      },
      {
        title: 'Budget Alert',
        message: 'Campaign "Summer Hits" has used 75% of budget',
        type: 'warning' as const,
      },
      {
        title: 'New Streams',
        message: 'Your track gained 1,000 new streams today',
        type: 'info' as const,
      },
    ]

    const interval = setInterval(() => {
      // Randomly show a notification every 30-60 seconds
      if (Math.random() > 0.5) {
        const notification = notifications[Math.floor(Math.random() * notifications.length)]
        addToast(notification)
      }
    }, 45000) // Every 45 seconds

    return () => clearInterval(interval)
  }, [addToast])
}