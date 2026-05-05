<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-6xl text-purple-400 mb-4" />
          <p class="text-white/60">Loading submission details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
        <div class="glass-morphism p-8 rounded-2xl max-w-md text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-bold text-red-400 mb-2">Unable to Load</h3>
          <p class="text-white/60 mb-6">{{ error }}</p>
          <div class="flex gap-3 justify-center">
            <UButton @click="fetchSubmission" variant="solid" color="purple">
              Retry
            </UButton>
            <UButton @click="$router.back()" variant="outline" color="white">
              Go Back
            </UButton>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="submission" class="space-y-6">
        <!-- Header Card -->
        <div class="glass-morphism p-6 sm:p-8 rounded-2xl border border-white/10">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div class="flex-1">
              <h1 class="text-3xl sm:text-4xl font-bold text-white mb-3">{{ submission.projectName }}</h1>
              <div class="flex flex-wrap items-center gap-3">
                <UBadge
                  :color="getStatusColor(submission.status)"
                  size="lg"
                  class="font-semibold"
                >
                  {{ submission.status.replace(/_/g, ' ') }}
                </UBadge>
                <span class="text-white/40 text-sm">
                  Submitted {{ formatDate(submission.createdAt) }}
                </span>
              </div>
            </div>
            <UButton
              @click="$router.back()"
              variant="outline"
              color="white"
              size="sm"
              class="w-fit border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10"
            >
              <template #leading>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </template>
              Back
            </UButton>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            <div class="text-center p-3 bg-white/5 rounded-lg">
              <div class="text-2xl mb-1">🏭</div>
              <div class="text-xs text-white/40 uppercase tracking-wider">Industry</div>
              <div class="text-sm font-semibold text-white mt-1">{{ submission.industry.replace(/_/g, ' ') }}</div>
            </div>
            <div class="text-center p-3 bg-white/5 rounded-lg">
              <div class="text-2xl mb-1">⚡</div>
              <div class="text-xs text-white/40 uppercase tracking-wider">Complexity</div>
              <div class="text-sm font-semibold text-white mt-1">{{ submission.complexity }}</div>
            </div>
            <div class="text-center p-3 bg-white/5 rounded-lg">
              <div class="text-2xl mb-1">💰</div>
              <div class="text-xs text-white/40 uppercase tracking-wider">Budget</div>
              <div class="text-sm font-semibold text-white mt-1">{{ formatBudget(submission.budget) }}</div>
            </div>
            <div class="text-center p-3 bg-white/5 rounded-lg">
              <div class="text-2xl mb-1">⏱️</div>
              <div class="text-xs text-white/40 uppercase tracking-wider">Timeline</div>
              <div class="text-sm font-semibold text-white mt-1">{{ submission.timeline || 'Not set' }}</div>
            </div>
          </div>
        </div>

        <!-- Project Types -->
        <div v-if="submission.projectTypes?.length" class="glass-morphism p-6 rounded-2xl border border-white/10">
          <h2 class="text-xl font-bold text-white mb-4">Project Types</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="type in submission.projectTypes"
              :key="type"
              class="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium border border-purple-500/30"
            >
              {{ type.replace(/_/g, ' ') }}
            </span>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Contact Info -->
          <div v-if="submission.user" class="glass-morphism p-6 rounded-2xl border border-white/10">
            <h2 class="text-xl font-bold text-white mb-4">Contact Information</h2>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {{ (submission.user.fullName || 'U')[0].toUpperCase() }}
                </div>
                <div class="flex-1">
                  <div class="text-white font-medium">{{ submission.user.fullName || 'Not provided' }}</div>
                  <div class="text-white/40 text-sm">{{ submission.user.email }}</div>
                </div>
              </div>
              <div v-if="submission.user.companyName" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <span class="text-2xl">🏢</span>
                <div>
                  <div class="text-white/40 text-xs uppercase">Company</div>
                  <div class="text-white">{{ submission.user.companyName }}</div>
                </div>
              </div>
              <div v-if="submission.user.phoneNumber" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <span class="text-2xl">📱</span>
                <div>
                  <div class="text-white/40 text-xs uppercase">Phone</div>
                  <div class="text-white">{{ submission.user.phoneNumber }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Details -->
          <div class="space-y-6">
            <div v-if="submission.country || submission.currency" class="glass-morphism p-6 rounded-2xl border border-white/10">
              <h2 class="text-xl font-bold text-white mb-4">Location & Currency</h2>
              <div class="space-y-3">
                <div v-if="submission.country" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span class="text-2xl">🌍</span>
                  <div>
                    <div class="text-white/40 text-xs uppercase">Country</div>
                    <div class="text-white">{{ submission.country }}</div>
                  </div>
                </div>
                <div v-if="submission.currency" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <span class="text-2xl">💱</span>
                  <div>
                    <div class="text-white/40 text-xs uppercase">Currency</div>
                    <div class="text-white">{{ submission.currency }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="glass-morphism p-6 sm:p-8 rounded-2xl border border-white/10">
          <h2 class="text-xl font-bold text-white mb-6">Selected Requirements</h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="(value, key) in submission.requirements"
              :key="key"
              class="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/30 transition"
            >
              <div
                :class="[
                  'w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  value ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/20'
                ]"
              >
                <svg v-if="value" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-white">{{ formatRequirementKey(key) }}</div>
                <div v-if="typeof value === 'string' || typeof value === 'number'" class="text-xs text-white/40 mt-0.5">
                  {{ value }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Notes -->
        <div v-if="submission.additionalNotes" class="glass-morphism p-6 sm:p-8 rounded-2xl border border-white/10">
          <h2 class="text-xl font-bold text-white mb-4">Additional Notes</h2>
          <div class="p-4 bg-white/5 rounded-xl border border-white/10">
            <p class="text-white/80 leading-relaxed">{{ submission.additionalNotes }}</p>
          </div>
        </div>

        <!-- Admin Notes -->
        <div v-if="submission.adminNotes" class="glass-morphism p-6 sm:p-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
          <h2 class="text-xl font-bold text-yellow-300 mb-4">Admin Notes</h2>
          <div class="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <p class="text-yellow-100 leading-relaxed">{{ submission.adminNotes }}</p>
          </div>
        </div>

        <!-- Collaboration & Versions -->
        <div class="grid md:grid-cols-2 gap-6">
          <div class="glass-morphism p-6 rounded-2xl border border-white/10">
            <VersionHistory :submission-id="submission.id" />
          </div>
          <div class="glass-morphism p-6 rounded-2xl border border-white/10">
            <CollabEditor :submission-id="submission.id" />
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="flex items-center justify-center min-h-[60vh]">
        <div class="glass-morphism p-8 rounded-2xl max-w-md text-center">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-bold text-white/60 mb-2">Submission Not Found</h3>
          <p class="text-white/40 mb-6">The submission you're looking for doesn't exist or you don't have access.</p>
          <UButton @click="$router.back()" variant="outline" color="white">
            Go Back
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const { user, getAccessToken } = useAuth()

const submission = ref<any>(null)
const loading = ref(true)
const error = ref('')

const fetchSubmission = async () => {
  try {
    const token = await getAccessToken()
    if (!token) {
      error.value = 'Authentication required'
      return
    }
    const data = await $fetch(`/api/submissions/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    submission.value = data
    error.value = ''
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load submission'
  } finally {
    loading.value = false
  }
}



const formatBudget = (budget: string | null) => {
  if (!budget) return 'Not specified'
  return budget.replace(/_/g, ' ').replace('FROM', '$').replace('TO', '-').replace('LESS THAN', '<').replace('ABOVE', '>')
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    REVIEWING': 'blue',
    QUOTED': 'purple',
    ACCEPTED': 'green',
    REJECTED': 'red',
    IN_PROGRESS': 'cyan',
    COMPLETED': 'emerald',
  }
  return colors[status] || 'gray'
}

const formatRequirementKey = (key: string) => {
  return key
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Watch for user to be available
watch(() => user.value, (newUser) => {
  if (newUser) {
    fetchSubmission()
  }
}, { immediate: true })
</script>
