<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">Book a Consultation</h1>
      <p class="text-white/70">Schedule a video call with our team to discuss your project</p>
    </div>

    <div v-if="loading" class="text-center py-20">
      <BaseSpinner size="lg" />
    </div>

    <div v-else class="grid lg:grid-cols-2 gap-8">
      <div>
        <BaseCard class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">Available Consultations</h2>
          
          <div v-if="!eventTypes.length" class="text-center py-8 text-white/50">
            <div class="text-4xl mb-3">📅</div>
            <p>No booking slots available</p>
            <p class="text-sm mt-1">Please check back later</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="event in eventTypes"
              :key="event.uri"
              class="glass-morphism p-4 rounded-lg border border-white/10 hover:border-purple-500/50 transition cursor-pointer"
              @click="selectEventType(event)"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-white font-semibold">{{ event.name }}</h3>
                  <p class="text-sm text-white/50 mt-1">{{ event.description || 'No description' }}</p>
                  <div class="flex items-center gap-3 mt-2 text-sm text-white/70">
                    <span>⏱️ {{ event.duration }} minutes</span>
                  </div>
                </div>
                <div class="text-purple-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <div>
        <BaseCard class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">Your Bookings</h2>
          
          <div v-if="!bookings.length" class="text-center py-8 text-white/50">
            <div class="text-4xl mb-3">📋</div>
            <p>No upcoming bookings</p>
            <p class="text-sm mt-1">Select a consultation to schedule</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="booking in upcomingBookings"
              :key="booking.eventUri"
              class="glass-morphism p-4 rounded-lg border border-white/10"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-white font-semibold">{{ booking.eventName }}</h3>
                  <p class="text-sm text-white/50 mt-1">
                    {{ formatDateTime(booking.startTime) }}
                  </p>
                  <BaseBadge :variant="getBookingStatusVariant(booking.status)" size="sm" class="mt-2">
                    {{ booking.status }}
                  </BaseBadge>
                </div>
                <a
                  v-if="booking.location"
                  :href="booking.location"
                  target="_blank"
                  class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                >
                  Join
                </a>
              </div>
            </div>

            <div v-if="pastBookings.length" class="mt-6 pt-6 border-t border-white/10">
              <h3 class="text-sm font-semibold text-white/50 mb-3">Past Bookings</h3>
              <div class="space-y-2">
                <div
                  v-for="booking in pastBookings"
                  :key="booking.eventUri"
                  class="text-sm text-white/40 py-2"
                >
                  {{ booking.eventName }} - {{ formatDateTime(booking.startTime) }}
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="p-6 mt-6">
          <h3 class="text-lg font-semibold text-white mb-3">How it works</h3>
          <ol class="space-y-3 text-white/70 text-sm">
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-300 font-bold">1</span>
              <span>Select a consultation type from the list</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-300 font-bold">2</span>
              <span>You'll be redirected to Calendly to pick a time</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-300 font-bold">3</span>
              <span>You'll receive a confirmation email with the meeting link</span>
            </li>
          </ol>
        </BaseCard>
      </div>
    </div>

    <BaseModal
      :show="showBookingModal"
      title="Book Consultation"
      size="lg"
      @close="showBookingModal = false"
    >
      <div class="text-center">
        <p class="text-white/70 mb-4">
          You'll be redirected to Calendly to schedule your {{ selectedEvent?.name }} consultation.
        </p>
        <BaseButton
          variant="primary"
          size="lg"
          :loading="loadingLink"
          @click="openCalendly"
        >
          Open Calendly
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

interface EventType {
  uri: string
  name: string
  duration: number
  description?: string
}

interface Booking {
  eventUri: string
  eventName: string
  startTime: string
  endTime: string
  status: string
  location?: string
}

definePageMeta({
  layout: 'default',
  ssr: false
})

const { user } = useAuth()

const loading = ref(true)
const loadingLink = ref(false)
const eventTypes = ref<EventType[]>([])
const bookings = ref<Booking[]>([])
const selectedEvent = ref<EventType | null>(null)
const showBookingModal = ref(false)

const upcomingBookings = computed(() =>
  bookings.value.filter(b =>
    new Date(b.startTime) > new Date() && b.status !== 'cancelled'
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
)

const pastBookings = computed(() =>
  bookings.value.filter(b =>
    new Date(b.startTime) <= new Date() || b.status === 'cancelled'
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  .slice(0, 5)
)

const fetchEventTypes = async () => {
  try {
    const data = await $fetch('/api/calendly/event-types')
    eventTypes.value = Array.isArray(data?.eventTypes) ? data.eventTypes : []
  } catch (error) {
    console.error('Failed to fetch event types:', error)
    eventTypes.value = []
  }
}

const fetchBookings = async () => {
  try {
    const data = await $fetch('/api/calendly/bookings')
    bookings.value = Array.isArray(data?.bookings) ? data.bookings : []
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    bookings.value = []
  }
}

const selectEventType = (event: EventType) => {
  selectedEvent.value = event
  showBookingModal.value = true
}

const openCalendly = async () => {
  if (!selectedEvent.value) return

  loadingLink.value = true
  try {
    const data = await $fetch(`/api/calendly/scheduling-link?eventTypeUri=${encodeURIComponent(selectedEvent.value.uri)}`)
    window.open(data.link, '_blank')
    showBookingModal.value = false
  } catch (error) {
    console.error('Failed to get scheduling link:', error)
  } finally {
    loadingLink.value = false
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const getBookingStatusVariant = (status: string) => {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    'active': 'success',
    'cancelled': 'danger',
    'payment_pending': 'warning'
  }
  return variants[status] || 'default'
}

onMounted(async () => {
  await Promise.all([fetchEventTypes(), fetchBookings()])
  loading.value = false
})
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
</style>
