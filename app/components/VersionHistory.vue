<template>
  <div class="version-history">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-white">Version History</h3>
        <BaseBadge v-if="versions.length" variant="info">{{ versions.length }} versions</BaseBadge>
      </div>
      <BaseButton
        variant="primary"
        size="sm"
        :loading="creating"
        @click="createNewVersion"
      >
        + Save Version
      </BaseButton>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <BaseSpinner />
    </div>

    <div v-else-if="!versions.length" class="text-center py-8 text-white/50">
      <div class="text-4xl mb-3">📜</div>
      <p>No versions saved yet</p>
      <p class="text-sm mt-1">Save a version to track changes over time</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="version in versions"
        :key="version.id"
        class="glass-morphism p-4 rounded-lg border border-white/10 hover:border-purple-500/30 transition cursor-pointer"
        @click="selectVersion(version)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <BaseBadge variant="default" size="sm">v{{ version.versionNumber }}</BaseBadge>
              <span class="text-xs text-white/40">{{ formatDate(version.createdAt) }}</span>
            </div>
            <h4 class="text-white font-medium">{{ version.title || `Version ${version.versionNumber}` }}</h4>
            <p v-if="version.description" class="text-sm text-white/50 mt-1">{{ version.description }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click.stop="viewVersionDetails(version)"
              class="text-white/40 hover:text-white transition"
              title="View Details"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              @click.stop="restoreVersion(version)"
              class="text-white/40 hover:text-purple-400 transition"
              title="Restore this version"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      :show="showDetailsModal"
      :title="`Version ${selectedVersion?.versionNumber} Details`"
      size="lg"
      @close="showDetailsModal = false"
    >
      <div v-if="selectedVersion" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <BaseBadge variant="default">v{{ selectedVersion.versionNumber }}</BaseBadge>
            <span class="text-sm text-white/50">{{ formatDate(selectedVersion.createdAt) }}</span>
          </div>
        </div>
        <div v-if="selectedVersion.title">
          <h4 class="text-sm font-semibold text-white/70 mb-1">Title</h4>
          <p class="text-white">{{ selectedVersion.title }}</p>
        </div>
        <div v-if="selectedVersion.description">
          <h4 class="text-sm font-semibold text-white/70 mb-1">Description</h4>
          <p class="text-white">{{ selectedVersion.description }}</p>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-white/70 mb-2">Changes Summary</h4>
          <GlowingScrollbar class="bg-gray-800/50 p-4 rounded-lg max-h-64"></GlowingScrollbar>
            <pre class="text-xs text-white/70 whitespace-pre-wrap">{{ formatJson(selectedVersion.changes) }}</pre>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-4 border-t border-white/10">
          <BaseButton variant="secondary" @click="showDetailsModal = false">Close</BaseButton>
          <BaseButton variant="primary" @click="restoreVersion(selectedVersion); showDetailsModal = false">
            Restore This Version
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
interface SubmissionVersion {
  id: string
  submissionId: string
  versionNumber: number
  title: string | null
  description: string | null
  changes: any
  createdAt: string
}

interface Props {
  submissionId: string
  initialVersions?: SubmissionVersion[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'version-selected': [version: SubmissionVersion]
  'version-restored': [version: SubmissionVersion]
  'version-created': [version: SubmissionVersion]
}>()

const loading = ref(false)
const creating = ref(false)
const versions = ref<SubmissionVersion[]>(props.initialVersions || [])
const selectedVersion = ref<SubmissionVersion | null>(null)
const showDetailsModal = ref(false)

const fetchVersions = async () => {
  if (!props.submissionId) return

  loading.value = true
  try {
    const data = await $fetch(`/api/submissions/${props.submissionId}/versions`)
    versions.value = data.versions
  } catch (error) {
    console.error('Failed to fetch versions:', error)
  } finally {
    loading.value = false
  }
}

const createNewVersion = async () => {
  if (!props.submissionId) return

  creating.value = true
  try {
    const data = await $fetch(`/api/submissions/${props.submissionId}/versions`, {
      method: 'POST',
      body: {
        title: `Version ${versions.value.length + 1}`,
        description: 'Manual version save'
      }
    })
    versions.value.unshift(data.version)
    emit('version-created', data.version)
  } catch (error) {
    console.error('Failed to create version:', error)
  } finally {
    creating.value = false
  }
}

const selectVersion = (version: SubmissionVersion) => {
  selectedVersion.value = version
  emit('version-selected', version)
}

const viewVersionDetails = (version: SubmissionVersion) => {
  selectedVersion.value = version
  showDetailsModal.value = true
}

const restoreVersion = async (version: SubmissionVersion) => {
  emit('version-restored', version)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatJson = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

onMounted(() => {
  if (versions.value.length === 0) {
    fetchVersions()
  }
})

watch(() => props.initialVersions, (newVersions) => {
  if (newVersions) {
    versions.value = newVersions
  }
})
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
</style>
