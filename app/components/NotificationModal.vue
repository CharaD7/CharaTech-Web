<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <!-- Modal -->
        <div class="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <!-- Colour accent bar by type -->
          <div class="h-1 w-full" :class="accentClass" />

          <!-- Header -->
          <div class="flex items-start justify-between p-5 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" :class="iconBgClass">
                {{ typeIcon }}
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider" :class="typeColorClass">{{ typeLabel }}</p>
                <h3 class="text-white font-bold text-base leading-tight mt-0.5">{{ notification.subject }}</h3>
              </div>
            </div>
            <button
              class="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
              @click="$emit('update:modelValue', false)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 pb-3">
            <p class="text-gray-300 text-sm leading-relaxed">{{ notification.message }}</p>

            <!-- Metadata chips -->
            <div v-if="metadataItems.length" class="mt-4 flex flex-wrap gap-2">
              <div
                v-for="item in metadataItems"
                :key="item.label"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
              >
                <span class="text-gray-500">{{ item.label }}</span>
                <span class="text-white font-medium">{{ item.value }}</span>
              </div>
            </div>

            <!-- Timestamp -->
            <p class="text-xs text-gray-500 mt-4">{{ formattedDate }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 px-5 py-4 border-t border-white/10 bg-white/5">
            <NuxtLink
              v-if="actionLink"
              :to="actionLink.to"
              class="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-xl text-center transition shadow-lg"
              @click="handleAction"
            >
              {{ actionLink.label }}
            </NuxtLink>

            <button
              v-if="!notification.read"
              class="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition border border-white/10"
              @click="handleMarkRead"
            >
              Mark as read
            </button>

            <button
              class="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-medium rounded-xl transition border border-white/10"
              @click="$emit('update:modelValue', false)"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { AppNotification } from '~/composables/useRealtimeNotifications'

const props = defineProps<{
  modelValue: boolean
  notification: AppNotification
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'mark-read': [id: string]
}>()

const { formatDate } = useRealtimeNotifications()

const formattedDate = computed(() => {
  if (!props.notification.createdAt) return 'Unknown date'
  const d = new Date(props.notification.createdAt)
  if (isNaN(d.getTime())) return 'Unknown date'
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
})

const typeConfig: Record<string, { icon: string; label: string; color: string; iconBg: string; accent: string }> = {
  SUBMISSION_RECEIVED: { icon: '📋', label: 'Submission', color: 'text-blue-400', iconBg: 'bg-blue-500/20', accent: 'bg-blue-500' },
  SUBMISSION_REVIEWED: { icon: '🔍', label: 'Reviewed', color: 'text-cyan-400', iconBg: 'bg-cyan-500/20', accent: 'bg-cyan-500' },
  STATUS_UPDATE:       { icon: '🔄', label: 'Status Update', color: 'text-yellow-400', iconBg: 'bg-yellow-500/20', accent: 'bg-yellow-500' },
  QUOTE_READY:         { icon: '💰', label: 'Quote Ready', color: 'text-green-400', iconBg: 'bg-green-500/20', accent: 'bg-green-500' },
  MESSAGE_RECEIVED:    { icon: '💬', label: 'Message', color: 'text-purple-400', iconBg: 'bg-purple-500/20', accent: 'bg-purple-500' },
  INVOICE_GENERATED:   { icon: '🧾', label: 'Invoice', color: 'text-orange-400', iconBg: 'bg-orange-500/20', accent: 'bg-orange-500' },
  TIMELINE_CREATED:    { icon: '📅', label: 'Timeline', color: 'text-indigo-400', iconBg: 'bg-indigo-500/20', accent: 'bg-indigo-500' },
  WELCOME:             { icon: '🎉', label: 'Welcome', color: 'text-pink-400', iconBg: 'bg-pink-500/20', accent: 'bg-pink-500' },
  REMINDER:            { icon: '⏰', label: 'Reminder', color: 'text-red-400', iconBg: 'bg-red-500/20', accent: 'bg-red-500' },
}

const config = computed(() => typeConfig[props.notification.type] ?? { icon: '🔔', label: 'Notification', color: 'text-gray-400', iconBg: 'bg-gray-500/20', accent: 'bg-gray-500' })
const typeIcon = computed(() => config.value.icon)
const typeLabel = computed(() => config.value.label)
const typeColorClass = computed(() => config.value.color)
const iconBgClass = computed(() => config.value.iconBg)
const accentClass = computed(() => config.value.accent)

// Build readable metadata chips
const metadataItems = computed(() => {
  const meta = props.notification.metadata as Record<string, any> | null
  if (!meta) return []
  const labelMap: Record<string, string> = {
    projectName: 'Project',
    clientEmail: 'Client',
    invoiceNumber: 'Invoice #',
    amount: 'Amount',
    submissionId: 'Submission ID',
  }
  return Object.entries(meta)
    .filter(([k, v]) => labelMap[k] && v != null)
    .map(([k, v]) => ({
      label: labelMap[k],
      value: k === 'amount' ? `$${Number(v).toFixed(2)}` : String(v).slice(0, 40),
    }))
})

// Deep-link action button based on metadata
const actionLink = computed(() => {
  const meta = props.notification.metadata as Record<string, any> | null
  if (!meta) return null
  if (meta.submissionId && ['SUBMISSION_RECEIVED', 'SUBMISSION_REVIEWED', 'STATUS_UPDATE'].includes(props.notification.type)) {
    return { label: 'View Submission', to: `/submissions/${meta.submissionId}` }
  }
  if (meta.invoiceId || props.notification.type === 'INVOICE_GENERATED') {
    return { label: 'Go to Dashboard', to: '/dashboard' }
  }
  if (meta.messageId || props.notification.type === 'MESSAGE_RECEIVED') {
    return { label: 'Open Messages', to: '/dashboard' }
  }
  return null
})

const handleAction = () => {
  if (!props.notification.read) emit('mark-read', props.notification.id)
  emit('update:modelValue', false)
}

const handleMarkRead = () => {
  emit('mark-read', props.notification.id)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
