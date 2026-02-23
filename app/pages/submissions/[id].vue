<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div v-if="loading" class="text-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-6xl text-white" />
    </div>

    <div v-else-if="submission" class="glass-morphism p-8 rounded-xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">{{ submission.projectName }}</h1>
        <UBadge :color="getStatusColor(submission.status)" size="lg">
          {{ submission.status }}
        </UBadge>
      </div>

      <div class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-semibold text-white mb-3">Project Details</h3>
            <div class="space-y-2 text-white/80">
              <p><strong>Industry:</strong> {{ submission.industry.replace(/_/g, ' ') }}</p>
              <p><strong>Complexity:</strong> {{ submission.complexity }}</p>
              <p><strong>Budget:</strong> {{ submission.budget?.replace(/_/g, ' ') || 'N/A' }}</p>
              <p><strong>Timeline:</strong> {{ submission.timeline || 'N/A' }}</p>
              <p><strong>Submitted:</strong> {{ formatDate(submission.createdAt) }}</p>
            </div>
          </div>

          <div v-if="submission.user">
            <h3 class="text-lg font-semibold text-white mb-3">Contact Information</h3>
            <div class="space-y-2 text-white/80">
              <p><strong>Name:</strong> {{ submission.user.fullName || 'N/A' }}</p>
              <p><strong>Email:</strong> {{ submission.user.email }}</p>
              <p><strong>Company:</strong> {{ submission.user.companyName || 'N/A' }}</p>
              <p><strong>Phone:</strong> {{ submission.user.phoneNumber || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <div v-if="submission.additionalNotes">
          <h3 class="text-lg font-semibold text-white mb-3">Additional Notes</h3>
          <p class="text-white/80 bg-white/5 p-4 rounded">{{ submission.additionalNotes }}</p>
        </div>

        <div v-if="submission.adminNotes">
          <h3 class="text-lg font-semibold text-white mb-3">Admin Notes</h3>
          <p class="text-white/80 bg-yellow-500/10 p-4 rounded border border-yellow-500/30">
            {{ submission.adminNotes }}
          </p>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-white mb-3">Selected Requirements</h3>
          <div class="bg-gray-900 p-4 rounded overflow-auto max-h-96">
            <pre class="text-xs text-white/80">{{ JSON.stringify(submission.requirements, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-between">
        <UButton @click="$router.back()" variant="outline">
          Back
        </UButton>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-white/70 text-xl">Submission not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const { user } = useAuth()

const submission = ref<any>(null)
const loading = ref(true)

const fetchSubmission = async () => {
  if (!user.value) return

  try {
    const token = await user.value.getIdToken()
    const data = await $fetch(`/api/submissions/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    submission.value = data
  } catch (error) {
    console.error('Failed to fetch submission:', error)
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  fetchSubmission()
})
</script>
