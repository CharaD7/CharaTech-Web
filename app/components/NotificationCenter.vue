<template>
  <div class="relative">
    <button 
      class="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
      @click="toggleDropdown"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
        {{ unreadCount }}
      </span>
    </button>

    <div 
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
      @click.stop
    >
      <div class="p-3 border-b border-gray-700">
        <h3 class="font-semibold text-white">Notifications</h3>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-400 text-sm">
          No notifications
        </div>
        
        <div 
          v-for="notification in notifications.slice(0, 5)" 
          :key="notification.id"
          class="p-3 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition"
          @click="markAsRead(notification.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-white truncate">
                {{ notification.subject }}
              </div>
              <div class="text-xs text-gray-400 mt-1 line-clamp-2">
                {{ notification.message }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatDate(notification.createdAt) }}
              </div>
            </div>
            <span v-if="!notification.read" class="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded font-medium">
              New
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="notifications.length > 0" class="p-3 border-t border-gray-700">
        <NuxtLink 
          to="/notifications" 
          class="block text-center text-sm text-purple-400 hover:text-purple-300 font-medium"
          @click="showDropdown = false"
        >
          View All Notifications
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()

const notifications = ref<any[]>([])
const showDropdown = ref(false)
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      showDropdown.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

const fetchNotifications = async () => {
  if (!user.value) return

  try {
    const token = await user.value.getIdToken()
    const data = await $fetch('/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    notifications.value = data
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

const markAsRead = async (id: string) => {
  if (!user.value) return

  try {
    const token = await user.value.getIdToken()
    await $fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(diff / 86400000)
  if (days < 7) return `${days}d ago`
  
  return d.toLocaleDateString()
}

onMounted(() => {
  fetchNotifications()
  
  // Refresh notifications every 30 seconds
  const interval = setInterval(fetchNotifications, 30000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>
