import type { RealtimeChannel } from '@supabase/supabase-js'

export interface AppNotification {
  id: string
  type: string
  subject: string
  message: string
  metadata: Record<string, any> | null
  read: boolean
  readAt: string | null
  archived: boolean
  archivedAt: string | null
  createdAt: string
}

let channel: RealtimeChannel | null = null

export const useRealtimeNotifications = () => {
  const { supabase } = useSupabase()
  const { user, getAccessToken } = useAuth()
  const toast = useToast()

  const notifications = useState<AppNotification[]>('notifications', () => [])
  const loading = ref(false)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  const fetchNotifications = async () => {
    if (!user.value) return
    loading.value = true
    try {
      const token = await getAccessToken()
      if (!token) return
      const data = await $fetch<AppNotification[]>('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      })
      notifications.value = data
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    } finally {
      loading.value = false
    }
  }

  const subscribe = () => {
    if (!user.value || channel) return

    // Listen for new rows inserted into the Notification table for this user
    channel = supabase
      .channel(`notifications:${user.value.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${user.value.id}`,
        },
        (payload) => {
          const raw = payload.new as any
          // Only add notification if it has a valid createdAt and not archived
          if (!raw.createdAt || raw.archived) return
          
          // Ensure dates are properly formatted
          const newNotification: AppNotification = {
            ...raw,
            createdAt: raw.createdAt,
            readAt: raw.readAt || null,
            archived: raw.archived || false,
            archivedAt: raw.archivedAt || null,
          }
          // Prepend so newest is first
          notifications.value = [newNotification, ...notifications.value]
          // Show a toast for in-app notifications
          if (newNotification.type !== 'WELCOME') {
            showToast(newNotification)
          }
        }
      )
      .subscribe()
  }

  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  const showToast = (notification: AppNotification) => {
    const iconMap: Record<string, string> = {
      SUBMISSION_RECEIVED: '📋',
      SUBMISSION_REVIEWED: '🔍',
      STATUS_UPDATE: '🔄',
      QUOTE_READY: '💰',
      MESSAGE_RECEIVED: '💬',
      INVOICE_GENERATED: '🧾',
      TIMELINE_CREATED: '📅',
      REMINDER: '⏰',
    }
    const icon = iconMap[notification.type] || '🔔'
    toast.add({
      title: `${icon} ${notification.subject}`,
      description: notification.message.length > 80 ? notification.message.slice(0, 80) + '…' : notification.message,
      color: 'purple' as any,
      timeout: 6000,
    })
  }

  const markAsRead = async (id: string) => {
    try {
      const token = await getAccessToken()
      if (!token) return
      await $fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const n = notifications.value.find(n => n.id === id)
      if (n) { n.read = true; n.readAt = new Date().toISOString() }
    } catch (e) {
      console.error('Failed to mark notification as read:', e)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = await getAccessToken()
      if (!token) return
      await $fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const now = new Date().toISOString()
      notifications.value = notifications.value.map(n => ({ ...n, read: true, readAt: now }))
    } catch (e) {
      console.error('Failed to mark all as read:', e)
    }
  }

  const bulkMarkAsRead = async (ids: string[]) => {
    try {
      const token = await getAccessToken()
      if (!token) return
      await $fetch('/api/notifications/bulk-read', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { ids },
      })
      const now = new Date().toISOString()
      notifications.value = notifications.value.map(n => 
        ids.includes(n.id) ? { ...n, read: true, readAt: now } : n
      )
    } catch (e) {
      console.error('Failed to bulk mark as read:', e)
    }
  }

  const bulkMarkAsUnread = async (ids: string[]) => {
    try {
      const token = await getAccessToken()
      if (!token) return
      await $fetch('/api/notifications/bulk-unread', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { ids },
      })
      notifications.value = notifications.value.map(n => 
        ids.includes(n.id) ? { ...n, read: false, readAt: null } : n
      )
    } catch (e) {
      console.error('Failed to bulk mark as unread:', e)
    }
  }

  const bulkArchive = async (ids: string[]) => {
    try {
      const token = await getAccessToken()
      if (!token) return
      await $fetch('/api/notifications/bulk-archive', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { ids },
      })
      // Remove archived notifications from the list
      notifications.value = notifications.value.filter(n => !ids.includes(n.id))
    } catch (e) {
      console.error('Failed to bulk archive:', e)
    }
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'Unknown date'
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Unknown date'
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(diff / 3600000)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(diff / 86400000)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    bulkMarkAsRead,
    bulkMarkAsUnread,
    bulkArchive,
    formatDate,
  }
}
