<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">
        Welcome, {{ userStore.currentUser?.fullName || 'User' }}! 👋
      </h1>
      <p class="text-white/70 text-lg">Manage your project requirement submissions</p>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <NuxtLink 
        to="/submit" 
        class="glass-morphism p-8 rounded-xl hover:scale-105 transition-transform group"
      >
        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">📝</div>
        <h2 class="text-2xl font-bold text-white mb-2">New Submission</h2>
        <p class="text-white/70">Start a new requirements form</p>
      </NuxtLink>

      <div class="glass-morphism p-8 rounded-xl">
        <div class="text-6xl mb-4">📊</div>
        <h2 class="text-2xl font-bold text-white mb-2">Total Submissions</h2>
        <p class="text-3xl font-bold text-purple-400">{{ submissions.length }}</p>
      </div>

      <div class="glass-morphism p-8 rounded-xl">
        <div class="text-6xl mb-4">⏱️</div>
        <h2 class="text-2xl font-bold text-white mb-2">Pending Review</h2>
        <p class="text-3xl font-bold text-yellow-400">{{ pendingCount }}</p>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div class="glass-morphism p-8 rounded-xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-white">Your Submissions</h2>
        <button
          v-if="submissions.length > 0"
          @click="fetchSubmissions"
          class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
        >
          Refresh
        </button>
      </div>
      
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-12 w-12 text-purple-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-white/70 mt-4">Loading submissions...</p>
      </div>

      <div v-else-if="submissions.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">📋</div>
        <p class="text-xl text-white/70 mb-6">No submissions yet</p>
        <NuxtLink to="/submit">
          <button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
            Create Your First Submission
          </button>
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="submission in submissions" 
          :key="submission.id"
          class="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition border border-white/10"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-xl font-semibold text-white mb-1">{{ submission.projectName }}</h3>
              <p class="text-white/60 text-sm">{{ submission.industry }}</p>
            </div>
            <span 
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                getStatusClass(submission.status)
              ]"
            >
              {{ submission.status }}
            </span>
          </div>
          <div class="grid md:grid-cols-3 gap-4 text-sm text-white/70 mb-4">
            <div>
              <span class="font-medium text-white">Complexity:</span> {{ submission.complexity }}
            </div>
            <div>
              <span class="font-medium text-white">Budget:</span> {{ submission.budget || 'Not specified' }}
            </div>
            <div>
              <span class="font-medium text-white">Submitted:</span> {{ formatDate(submission.createdAt) }}
            </div>
          </div>
          <NuxtLink :to="`/submissions/${submission.id}`" class="inline-block">
            <button class="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition">
              View Details →
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Submission } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const userStore = useUserStore()
const { user } = useAuth()

// Redirect admins to admin dashboard
if (userStore.currentUser?.role === 'ADMIN') {
  await navigateTo('/admin/dashboard')
}

const submissions = ref<Submission[]>([])
const loading = ref(true)

const fetchSubmissions = async () => {
  if (!user.value) return

  try {
    const token = await user.value.getIdToken()
    const data = await $fetch<Submission[]>('/api/submissions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    submissions.value = data
  } catch (error) {
    console.error('Failed to fetch submissions:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSubmissions()
})

const pendingCount = computed(() => {
  return submissions.value.filter(s => s.status === 'PENDING' || s.status === 'REVIEWING').length
})

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    REVIEWING: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    QUOTED: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    ACCEPTED: 'bg-green-500/20 text-green-300 border border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-300 border border-red-500/30',
    IN_PROGRESS: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  }
  return classes[status] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    REVIEWING: 'blue',
    QUOTED: 'purple',
    ACCEPTED: 'green',
    REJECTED: 'red',
    IN_PROGRESS: 'cyan',
    COMPLETED: 'emerald',
  }
  return colors[status] || 'gray'
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
