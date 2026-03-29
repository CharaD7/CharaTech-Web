<template>
  <div class="relative" ref="containerRef">
    <!-- Bell button -->
    <button
      class="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
      type="button"
      @click="toggleDropdown"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      <Transition name="badge">
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Transition>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="showDropdown"
        class="fixed left-2 right-2 top-[68px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-white">Notifications</h3>
            <span v-if="unreadCount > 0" class="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full font-semibold">
              {{ unreadCount }} new
            </span>
          </div>
          <button
            v-if="unreadCount > 0"
            class="text-xs text-purple-400 hover:text-purple-300 font-medium transition"
            @click="markAllAsRead"
          >
            Mark all read
          </button>
        </div>

        <!-- List -->
        <GlowingScrollbar class="max-h-[60vh] sm:max-h-[420px] divide-y divide-white/5"></GlowingScrollbar>
          <!-- Loading skeleton -->
          <template v-if="loading">
            <div v-for="i in 3" :key="i" class="p-4 animate-pulse">
              <div class="flex gap-3">
                <div class="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-2">
                  <div class="h-3 bg-white/10 rounded w-3/4" />
                  <div class="h-3 bg-white/10 rounded w-full" />
                  <div class="h-2 bg-white/10 rounded w-1/4" />
                </div>
              </div>
            </div>
          </template>

          <div v-else-if="notifications.length === 0" class="py-12 text-center">
            <div class="text-4xl mb-3">🔔</div>
            <p class="text-gray-400 text-sm">You're all caught up!</p>
          </div>

          <button
            v-for="n in notifications.slice(0, 6)"
            :key="n.id"
            class="w-full text-left px-4 py-3 hover:bg-white/5 transition flex items-start gap-3 group"
            :class="{ 'bg-purple-500/5': !n.read }"
            @click="openNotification(n)"
          >
            <!-- Type icon -->
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
              :class="iconBg(n.type)"
            >
              {{ typeIcon(n.type) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" :class="categoryBg(n.type)">
                  {{ categoryLabel(n.type) }}
                </span>
                <span v-if="!n.read" class="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1" />
              </div>
              <p class="text-sm font-medium text-white truncate leading-tight mb-0.5">{{ n.subject }}</p>
              <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">{{ n.message }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ formatDate(n.createdAt) }}</p>
            </div>
          </button>
        </div>

        <!-- Footer -->
        <div class="border-t border-white/10 px-4 py-3 bg-white/5">
          <NuxtLink
            to="/notifications"
            class="block text-center text-sm text-purple-400 hover:text-purple-300 font-medium transition"
            @click="showDropdown = false"
          >
            View all notifications →
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Detail modal -->
    <NotificationModal
      v-if="selectedNotification"
      v-model="showModal"
      :notification="selectedNotification"
      @mark-read="markAsRead"
    />
  </div>
</template>

<script setup lang="ts">
import type { AppNotification } from '~/composables/useRealtimeNotifications'

const { notifications, unreadCount, loading, fetchNotifications, subscribe, unsubscribe, markAsRead, markAllAsRead, formatDate } = useRealtimeNotifications()

const showDropdown = ref(false)
const showModal = ref(false)
const selectedNotification = ref<AppNotification | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const openNotification = (n: AppNotification) => {
  selectedNotification.value = n
  showModal.value = true
  showDropdown.value = false
  if (!n.read) markAsRead(n.id)
}

// Click-outside
onMounted(async () => {
  await fetchNotifications()
  subscribe()

  const handler = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      showDropdown.value = false
    }
  }
  document.addEventListener('click', handler)
  onUnmounted(() => {
    document.removeEventListener('click', handler)
    unsubscribe()
  })
})

const iconMap: Record<string, string> = {
  SUBMISSION_RECEIVED: '📋',
  SUBMISSION_REVIEWED: '🔍',
  STATUS_UPDATE: '🔄',
  QUOTE_READY: '💰',
  MESSAGE_RECEIVED: '💬',
  INVOICE_GENERATED: '🧾',
  TIMELINE_CREATED: '📅',
  WELCOME: '🎉',
  REMINDER: '⏰',
}

const iconBgMap: Record<string, string> = {
  SUBMISSION_RECEIVED: 'bg-blue-500/20',
  SUBMISSION_REVIEWED: 'bg-cyan-500/20',
  STATUS_UPDATE: 'bg-yellow-500/20',
  QUOTE_READY: 'bg-green-500/20',
  MESSAGE_RECEIVED: 'bg-purple-500/20',
  INVOICE_GENERATED: 'bg-orange-500/20',
  TIMELINE_CREATED: 'bg-indigo-500/20',
  WELCOME: 'bg-pink-500/20',
  REMINDER: 'bg-red-500/20',
}

const categoryBgMap: Record<string, string> = {
  SUBMISSION_RECEIVED: 'bg-blue-500/20 text-blue-300',
  SUBMISSION_REVIEWED: 'bg-cyan-500/20 text-cyan-300',
  STATUS_UPDATE: 'bg-yellow-500/20 text-yellow-300',
  QUOTE_READY: 'bg-green-500/20 text-green-300',
  MESSAGE_RECEIVED: 'bg-purple-500/20 text-purple-300',
  INVOICE_GENERATED: 'bg-orange-500/20 text-orange-300',
  TIMELINE_CREATED: 'bg-indigo-500/20 text-indigo-300',
  WELCOME: 'bg-pink-500/20 text-pink-300',
  REMINDER: 'bg-red-500/20 text-red-300',
}

const categoryLabelMap: Record<string, string> = {
  SUBMISSION_RECEIVED: 'Submission',
  SUBMISSION_REVIEWED: 'Review',
  STATUS_UPDATE: 'Update',
  QUOTE_READY: 'Quote',
  MESSAGE_RECEIVED: 'Message',
  INVOICE_GENERATED: 'Invoice',
  TIMELINE_CREATED: 'Timeline',
  WELCOME: 'Welcome',
  REMINDER: 'Reminder',
}

const typeIcon = (type: string) => iconMap[type] ?? '🔔'
const iconBg = (type: string) => iconBgMap[type] ?? 'bg-gray-500/20'
const categoryBg = (type: string) => categoryBgMap[type] ?? 'bg-gray-500/20 text-gray-300'
const categoryLabel = (type: string) => categoryLabelMap[type] ?? type
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.badge-enter-active, .badge-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.badge-enter-from, .badge-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>

