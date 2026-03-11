<template>
  <div class="min-h-screen py-10 px-4">
    <div class="max-w-3xl mx-auto">

      <!-- Page header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Notifications</h1>
          <p class="text-gray-400 text-sm mt-1">
            {{ unreadCount > 0 ? `${unreadCount} unread` : 'All caught up' }}
          </p>
        </div>
        <button
          v-if="unreadCount > 0"
          class="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-sm font-medium rounded-xl border border-purple-500/30 transition"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="f in filters"
          :key="f.value"
          class="px-4 py-1.5 rounded-xl text-sm font-medium transition border"
          :class="activeFilter === f.value
            ? 'bg-purple-600 text-white border-purple-500'
            : 'bg-white/5 text-gray-400 hover:text-white border-white/10 hover:border-white/20'"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span v-if="f.count" class="ml-1.5 text-xs opacity-70">({{ f.count }})</span>
        </button>
      </div>

      <!-- List -->
      <div class="space-y-2">
        <!-- Loading skeleton -->
        <template v-if="loading">
          <div v-for="i in 5" :key="i" class="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
            <div class="flex gap-4">
              <div class="w-10 h-10 bg-white/10 rounded-xl flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-white/10 rounded w-2/3" />
                <div class="h-3 bg-white/10 rounded w-full" />
                <div class="h-3 bg-white/10 rounded w-1/4" />
              </div>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else-if="filtered.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">{{ activeFilter === 'unread' ? '✅' : '🔔' }}</div>
          <p class="text-white font-semibold text-lg">
            {{ activeFilter === 'unread' ? 'All caught up!' : 'No notifications here' }}
          </p>
          <p class="text-gray-400 text-sm mt-1">
            {{ activeFilter === 'unread' ? 'No unread notifications.' : 'Notifications will appear here as activity happens.' }}
          </p>
        </div>

        <!-- Notification rows -->
        <button
          v-for="n in paginated"
          :key="n.id"
          class="w-full text-left bg-white/5 hover:bg-white/10 border rounded-2xl p-4 transition flex items-start gap-4 group"
          :class="n.read ? 'border-white/10' : 'border-purple-500/30 bg-purple-500/5'"
          @click="open(n)"
        >
          <!-- Icon -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" :class="iconBg(n.type)">
            {{ typeIcon(n.type) }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <p class="text-sm font-semibold text-white leading-tight">{{ n.subject }}</p>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span v-if="!n.read" class="w-2 h-2 rounded-full bg-purple-400" />
                <span class="text-xs text-gray-500 whitespace-nowrap">{{ formatDate(n.createdAt) }}</span>
              </div>
            </div>
            <p class="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{{ n.message }}</p>
            <span class="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium" :class="typeColor(n.type)">
              {{ typeLabel(n.type) }}
            </span>
          </div>
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <button
          :disabled="page === 1"
          class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
          @click="page--"
        >
          ← Previous
        </button>
        <span class="text-gray-400 text-sm px-2">{{ page }} / {{ totalPages }}</span>
        <button
          :disabled="page === totalPages"
          class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
          @click="page++"
        >
          Next →
        </button>
      </div>

    </div>

    <!-- Detail modal -->
    <NotificationModal
      v-if="selected"
      v-model="showModal"
      :notification="selected"
      @mark-read="markAsRead"
    />
  </div>
</template>

<script setup lang="ts">
import type { AppNotification } from '~/composables/useRealtimeNotifications'

definePageMeta({ middleware: ['auth'] })

const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, formatDate } = useRealtimeNotifications()

const activeFilter = ref<'all' | 'unread' | 'SUBMISSION_RECEIVED' | 'MESSAGE_RECEIVED' | 'INVOICE_GENERATED' | 'STATUS_UPDATE'>('all')
const page = ref(1)
const perPage = 10
const selected = ref<AppNotification | null>(null)
const showModal = ref(false)

onMounted(fetchNotifications)

// Reset to page 1 when filter changes
watch(activeFilter, () => { page.value = 1 })

const filtered = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  if (activeFilter.value === 'unread') return notifications.value.filter(n => !n.read)
  return notifications.value.filter(n => n.type === activeFilter.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))

const filters = computed(() => [
  { value: 'all', label: 'All', count: notifications.value.length },
  { value: 'unread', label: 'Unread', count: unreadCount.value },
  { value: 'MESSAGE_RECEIVED', label: 'Messages', count: notifications.value.filter(n => n.type === 'MESSAGE_RECEIVED').length },
  { value: 'SUBMISSION_RECEIVED', label: 'Submissions', count: notifications.value.filter(n => n.type === 'SUBMISSION_RECEIVED').length },
  { value: 'INVOICE_GENERATED', label: 'Invoices', count: notifications.value.filter(n => ['INVOICE_GENERATED', 'QUOTE_READY'].includes(n.type)).length },
  { value: 'STATUS_UPDATE', label: 'Updates', count: notifications.value.filter(n => n.type === 'STATUS_UPDATE').length },
].filter(f => f.count > 0 || f.value === 'all' || f.value === 'unread'))

const open = (n: AppNotification) => {
  selected.value = n
  showModal.value = true
  if (!n.read) markAsRead(n.id)
}

const iconMap: Record<string, string> = {
  SUBMISSION_RECEIVED: '📋', SUBMISSION_REVIEWED: '🔍', STATUS_UPDATE: '🔄',
  QUOTE_READY: '💰', MESSAGE_RECEIVED: '💬', INVOICE_GENERATED: '🧾',
  TIMELINE_CREATED: '📅', WELCOME: '🎉', REMINDER: '⏰',
}
const iconBgMap: Record<string, string> = {
  SUBMISSION_RECEIVED: 'bg-blue-500/20', SUBMISSION_REVIEWED: 'bg-cyan-500/20',
  STATUS_UPDATE: 'bg-yellow-500/20', QUOTE_READY: 'bg-green-500/20',
  MESSAGE_RECEIVED: 'bg-purple-500/20', INVOICE_GENERATED: 'bg-orange-500/20',
  TIMELINE_CREATED: 'bg-indigo-500/20', WELCOME: 'bg-pink-500/20', REMINDER: 'bg-red-500/20',
}
const typeColorMap: Record<string, string> = {
  SUBMISSION_RECEIVED: 'bg-blue-500/20 text-blue-300', SUBMISSION_REVIEWED: 'bg-cyan-500/20 text-cyan-300',
  STATUS_UPDATE: 'bg-yellow-500/20 text-yellow-300', QUOTE_READY: 'bg-green-500/20 text-green-300',
  MESSAGE_RECEIVED: 'bg-purple-500/20 text-purple-300', INVOICE_GENERATED: 'bg-orange-500/20 text-orange-300',
  TIMELINE_CREATED: 'bg-indigo-500/20 text-indigo-300', WELCOME: 'bg-pink-500/20 text-pink-300',
  REMINDER: 'bg-red-500/20 text-red-300',
}
const labelMap: Record<string, string> = {
  SUBMISSION_RECEIVED: 'Submission', SUBMISSION_REVIEWED: 'Reviewed', STATUS_UPDATE: 'Update',
  QUOTE_READY: 'Quote', MESSAGE_RECEIVED: 'Message', INVOICE_GENERATED: 'Invoice',
  TIMELINE_CREATED: 'Timeline', WELCOME: 'Welcome', REMINDER: 'Reminder',
}

const typeIcon = (t: string) => iconMap[t] ?? '🔔'
const iconBg = (t: string) => iconBgMap[t] ?? 'bg-gray-500/20'
const typeColor = (t: string) => typeColorMap[t] ?? 'bg-gray-500/20 text-gray-300'
const typeLabel = (t: string) => labelMap[t] ?? t
</script>
