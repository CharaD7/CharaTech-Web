<template>
  <div class="linear-issues-panel">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-white">Linear Issues</h3>
        <BaseBadge v-if="issues.length" variant="info">{{ issues.length }} issues</BaseBadge>
      </div>
      <div class="flex gap-2">
        <BaseButton
          v-if="!issues.length"
          variant="primary"
          size="sm"
          :loading="syncing"
          @click="$emit('sync')"
        >
          🔄 Sync to Linear
        </BaseButton>
        <BaseButton
          v-if="teams.length"
          variant="secondary"
          size="sm"
          @click="showTeamSelector = true"
        >
          🔗 Change Team
        </BaseButton>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <BaseSpinner />
    </div>

    <div v-else-if="!issues.length" class="text-center py-8 text-white/50">
      <div class="text-4xl mb-3">📋</div>
      <p>No Linear issues synced yet</p>
      <p class="text-sm mt-1">Sync this submission to create issues in Linear</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="issue in issues"
        :key="issue.id"
        class="glass-morphism p-4 rounded-lg border border-white/10 hover:border-purple-500/30 transition"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <a
                :href="issue.linearUrl"
                target="_blank"
                class="text-purple-300 font-mono text-sm hover:underline"
              >
                #{{ issue.linearNumber }}
              </a>
              <BaseBadge :variant="getStateVariant(issue.linearState)" size="sm">
                {{ issue.linearState }}
              </BaseBadge>
              <BaseBadge v-if="issue.linearPriority" :variant="getPriorityVariant(issue.linearPriority)" size="sm">
                {{ getPriorityLabel(issue.linearPriority) }}
              </BaseBadge>
            </div>
            <h4 class="text-white font-medium">{{ issue.linearTitle }}</h4>
            <div v-if="issue.assignee" class="text-xs text-white/50 mt-1">
              Assigned to: {{ issue.assignee }}
            </div>
          </div>
          <a
            :href="issue.linearUrl"
            target="_blank"
            class="text-white/40 hover:text-white transition"
            title="Open in Linear"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <BaseModal
      :show="showTeamSelector"
      title="Select Linear Team"
      @close="showTeamSelector = false"
    >
      <div class="space-y-2">
        <button
          v-for="team in teams"
          :key="team.id"
          @click="selectTeam(team)"
          class="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
          <div class="font-medium text-white">{{ team.name }}</div>
          <div class="text-sm text-white/50">{{ team.key }}</div>
        </button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

interface LinearTeam {
  id: string
  name: string
  key: string
}

interface LinearIssue {
  id: string
  linearId: string
  linearNumber: number
  linearTitle: string
  linearUrl: string
  linearState: string
  linearPriority: number | null
  assignee: string | null
  dueDate: string | null
}

interface Props {
  submissionId: string
  initialIssues?: LinearIssue[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  sync: []
  'team-selected': [teamId: string]
}>()

const loading = ref(false)
const syncing = ref(false)
const issues = ref<LinearIssue[]>(props.initialIssues || [])
const teams = ref<LinearTeam[]>([])
const showTeamSelector = ref(false)

const fetchTeams = async () => {
  try {
    const data = await $fetch('/api/linear/teams')
    teams.value = data.teams
  } catch (error) {
    console.error('Failed to fetch Linear teams:', error)
  }
}

const fetchIssues = async () => {
  if (!props.submissionId) return
  
  loading.value = true
  try {
    const data = await $fetch(`/api/linear/submission-issues?submissionId=${props.submissionId}`)
    issues.value = data.issues
  } catch (error) {
    console.error('Failed to fetch Linear issues:', error)
  } finally {
    loading.value = false
  }
}

const selectTeam = (team: LinearTeam) => {
  showTeamSelector.value = false
  emit('team-selected', team.id)
}

const getStateVariant = (state: string) => {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    'Done': 'success',
    'In Progress': 'warning',
    'In Review': 'info',
    'Cancelled': 'danger',
    'Backlog': 'default',
    'Triaged': 'default'
  }
  return variants[state] || 'default'
}

const getPriorityVariant = (priority: number) => {
  if (priority >= 4) return 'danger'
  if (priority >= 2) return 'warning'
  return 'default'
}

const getPriorityLabel = (priority: number) => {
  const labels: Record<number, string> = {
    0: 'No priority',
    1: 'Urgent',
    2: 'High',
    3: 'Medium',
    4: 'Low'
  }
  return labels[priority] || `P${priority}`
}

onMounted(() => {
  if (issues.value.length === 0) {
    fetchIssues()
  }
  fetchTeams()
})

watch(() => props.initialIssues, (newIssues) => {
  if (newIssues) {
    issues.value = newIssues
  }
})
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
</style>
