<script setup lang="ts">
/**
 * ProjectTimelinePanel — Feature-rich GitHub-connected project timeline.
 * Tabs: Overview | Milestones | Activity | Code Stats
 * All charts built with pure SVG/CSS (zero extra dependencies).
 */

const props = defineProps<{
  timeline: any // ProjectTimeline from DB (with milestones[])
  adminMode?: boolean
}>()

const emit = defineEmits<{
  updated: [timeline: any]
}>()

// ─── State ────────────────────────────────────────────────────────────────
const activeTab = ref<'overview' | 'milestones' | 'activity' | 'codestats'>('overview')
const githubData = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const linking = ref(false)

// Repo linking
const repoSearch = ref('')
const repoSearchLoading = ref(false)
const repoSearchResults = ref<any[]>([])
const showRepoDropdown = ref(false)
const savingRepo = ref(false)

// ─── Load GitHub data ────────────────────────────────────────────────────
async function loadGitHubData() {
  if (!props.timeline?.githubRepo) return
  loading.value = true
  error.value = null
  try {
    const { useAuth } = await import('~/composables/useAuth')
    const { getAccessToken } = useAuth()
    const token = await getAccessToken()
    const data = await $fetch(`/api/admin/timelines/${props.timeline.id}/github`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    githubData.value = data
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to load GitHub data'
  } finally {
    loading.value = false
  }
}

// ─── Repo search & link ───────────────────────────────────────────────────
async function searchRepos() {
  if (!repoSearch.value.trim()) { repoSearchResults.value = []; return }
  repoSearchLoading.value = true
  try {
    const { useAuth } = await import('~/composables/useAuth')
    const { getAccessToken } = useAuth()
    const token = await getAccessToken()
    repoSearchResults.value = await $fetch('/api/admin/github/repos', {
      query: { search: repoSearch.value },
      headers: { Authorization: `Bearer ${token}` },
    }) as any[]
    showRepoDropdown.value = true
  } catch {
    repoSearchResults.value = []
  } finally {
    repoSearchLoading.value = false
  }
}

async function loadAllRepos() {
  repoSearchLoading.value = true
  showRepoDropdown.value = true
  try {
    const { useAuth } = await import('~/composables/useAuth')
    const { getAccessToken } = useAuth()
    const token = await getAccessToken()
    repoSearchResults.value = await $fetch('/api/admin/github/repos', {
      headers: { Authorization: `Bearer ${token}` },
    }) as any[]
  } catch {
    repoSearchResults.value = []
  } finally {
    repoSearchLoading.value = false
  }
}

async function linkRepo(repo: any) {
  savingRepo.value = true
  showRepoDropdown.value = false
  linking.value = false
  try {
    const { useAuth } = await import('~/composables/useAuth')
    const { getAccessToken } = useAuth()
    const token = await getAccessToken()
    const result = await $fetch(`/api/admin/timelines/${props.timeline.id}`, {
      method: 'PATCH',
      body: { githubRepo: repo.fullName, githubRepoId: repo.id },
      headers: { Authorization: `Bearer ${token}` },
    }) as any
    emit('updated', result.timeline)
    await loadGitHubData()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to link repo'
  } finally {
    savingRepo.value = false
  }
}

async function unlinkRepo() {
  if (!confirm('Unlink this GitHub repository from the timeline?')) return
  savingRepo.value = true
  try {
    const { useAuth } = await import('~/composables/useAuth')
    const { getAccessToken } = useAuth()
    const token = await getAccessToken()
    const result = await $fetch(`/api/admin/timelines/${props.timeline.id}`, {
      method: 'PATCH',
      body: { githubRepo: null, githubRepoId: null },
      headers: { Authorization: `Bearer ${token}` },
    }) as any
    githubData.value = null
    emit('updated', result.timeline)
  } finally {
    savingRepo.value = false
  }
}

// ─── Computed helpers ─────────────────────────────────────────────────────
const gh = computed(() => githubData.value?.github)
const repo = computed(() => gh.value?.repo)
const progress = computed(() => gh.value?.progress ?? 0)

const languageData = computed(() => {
  const langs = gh.value?.languages ?? {}
  const total = Object.values(langs).reduce((s: number, v: any) => s + v, 0) as number
  if (total === 0) return []
  const colors = ['#7c3aed','#a78bfa','#4c1d95','#6d28d9','#ddd6fe','#5b21b6','#8b5cf6','#c4b5fd']
  return Object.entries(langs)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 8)
    .map(([name, bytes], i) => ({
      name,
      bytes: bytes as number,
      pct: Math.round(((bytes as number) / total) * 100),
      color: colors[i % colors.length],
    }))
})

// SVG donut language chart
const DONUT_R = 52
const DONUT_CX = 70
const DONUT_CY = 70
const DONUT_STROKE = 20

const donutArcs = computed(() => {
  let offset = 0
  const circumference = 2 * Math.PI * DONUT_R
  return languageData.value.map(lang => {
    const dash = (lang.pct / 100) * circumference
    const arc = { dash, gap: circumference - dash, offset, color: lang.color, name: lang.name, pct: lang.pct }
    offset += dash
    return arc
  })
})

// Weekly bar chart (last 12 weeks from commit activity)
const weeklyBars = computed(() => {
  const activity = gh.value?.commitActivity
  if (!activity || !activity.length) return []
  const last12 = activity.slice(-12)
  const max = Math.max(...last12.map((w: any) => w.total), 1)
  return last12.map((w: any, i: number) => ({
    height: Math.max(2, Math.round((w.total / max) * 80)),
    total: w.total,
    label: new Date(w.week * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    index: i,
  }))
})

// Code frequency chart (area)
const codeFreqData = computed(() => {
  const freq = gh.value?.codeFrequency
  if (!freq || !freq.length) return { adds: [], dels: [], maxVal: 1, points: 40 }
  const recent = freq.slice(-40)
  const maxVal = Math.max(...recent.flatMap(([, a, d]: number[]) => [a, Math.abs(d)]), 1)
  return {
    adds: recent.map(([, a]: number[]) => a),
    dels: recent.map(([, , d]: number[]) => Math.abs(d)),
    maxVal,
    points: recent.length,
  }
})

function svgAreaPath(values: number[], maxVal: number, w: number, h: number, flip = false): string {
  if (!values.length) return ''
  const stepX = w / (values.length - 1)
  const pts = values.map((v, i) => {
    const x = i * stepX
    const y = flip ? (v / maxVal) * h : h - (v / maxVal) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M0,${flip ? 0 : h} L${pts.join(' L')} L${((values.length - 1) * stepX).toFixed(1)},${flip ? 0 : h} Z`
}

// Timeline progress vs expected
const timelineProgress = computed(() => {
  const t = props.timeline
  if (!t?.startDate || !t?.endDate) return null
  const start = new Date(t.startDate).getTime()
  const end = new Date(t.endDate).getTime()
  const now = Date.now()
  const expected = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
  const actual = progress.value
  return { expected, actual, isAhead: actual >= expected, diff: actual - expected }
})

// Completion ring SVG
const RING_R = 48
const RING_STROKE = 8
const ringCircumference = 2 * Math.PI * RING_R
const ringDash = computed(() => (progress.value / 100) * ringCircumference)

// Format helpers
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatRelative(d: string | null) {
  if (!d) return '—'
  const ms = Date.now() - new Date(d).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
function truncate(s: string, n = 72) {
  return s.length > n ? s.substring(0, n) + '…' : s
}
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}
function milestoneStatusClass(s: string) {
  return {
    COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    PENDING: 'bg-white/10 text-white/50 border-white/10',
    DELAYED: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    CANCELLED: 'bg-red-500/20 text-red-300 border-red/30',
  }[s] || 'bg-white/10 text-white/50'
}

// Debounced repo search
let searchTimer: ReturnType<typeof setTimeout>
watch(repoSearch, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(searchRepos, 300)
})

onMounted(() => {
  if (props.timeline?.githubRepo) loadGitHubData()
})

watch(() => props.timeline?.id, (id) => {
  if (id && props.timeline?.githubRepo) loadGitHubData()
})
</script>

<template>
  <div class="project-timeline-panel">
    <!-- ─── GitHub Integration Header ─────────────────────────────────── -->
    <div class="glass-morphism rounded-xl border border-white/10 p-5 mb-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <!-- GitHub icon -->
          <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
            <svg viewBox="0 0 24 24" class="w-5 h-5 fill-white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12C24 5.37 18.63 0 12 0z"/></svg>
          </div>
          <div>
            <div v-if="timeline.githubRepo" class="text-white font-semibold flex items-center gap-2">
              <a :href="`https://github.com/${timeline.githubRepo}`" target="_blank"
                class="hover:text-purple-400 transition-colors">
                {{ timeline.githubRepo }}
              </a>
              <span v-if="repo" class="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                {{ repo.language ?? 'No language' }}
              </span>
            </div>
            <div v-else class="text-white/50 text-sm">No GitHub repository linked</div>
            <div v-if="repo" class="text-xs text-white/40 mt-0.5">
              ⭐ {{ repo.stargazers_count }} · 🍴 {{ repo.forks_count }} · Last push: {{ formatRelative(repo.pushed_at) }}
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2 flex-wrap">
          <button v-if="timeline.githubRepo && !loading" @click="loadGitHubData"
            class="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-all">
            🔄 Sync
          </button>
          <button v-if="adminMode && timeline.githubRepo" @click="unlinkRepo" :disabled="savingRepo"
            class="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
            🔗 Unlink
          </button>
          <button v-if="adminMode && !linking" @click="linking = true; loadAllRepos()"
            class="text-xs px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 transition-all">
            {{ timeline.githubRepo ? '🔀 Change Repo' : '🔗 Link GitHub Repo' }}
          </button>
        </div>
      </div>

      <!-- Repo search dropdown -->
      <div v-if="linking" class="mt-4 relative">
        <div class="flex gap-2">
          <input v-model="repoSearch"
            placeholder="Search repositories…"
            class="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60"
            @focus="repoSearchResults.length ? undefined : loadAllRepos()"
          />
          <button @click="linking = false; showRepoDropdown = false"
            class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 text-sm">
            ✕
          </button>
        </div>

        <div v-if="showRepoDropdown" class="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl bg-gray-900/98 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div v-if="repoSearchLoading" class="p-4 text-center text-white/40 text-sm">Loading…</div>
          <div v-else-if="!repoSearchResults.length" class="p-4 text-center text-white/40 text-sm">No repos found</div>
          <button v-for="r in repoSearchResults" :key="r.id"
            @click="linkRepo(r)"
            class="w-full text-left px-4 py-3 hover:bg-purple-500/10 border-b border-white/5 last:border-0 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-white font-medium text-sm">{{ r.name }}</span>
                <span v-if="r.language" class="ml-2 text-xs text-purple-400">{{ r.language }}</span>
              </div>
              <div class="text-xs text-white/30">⭐ {{ r.stars }}</div>
            </div>
            <div v-if="r.description" class="text-xs text-white/40 mt-0.5 truncate">{{ r.description }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Error ──────────────────────────────────────────────────────── -->
    <div v-if="error" class="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
      ⚠️ {{ error }}
      <button @click="loadGitHubData" class="ml-3 underline text-red-400 hover:text-red-300">Retry</button>
    </div>

    <!-- ─── Stats Cards ───────────────────────────────────────────────── -->
    <div v-if="gh || loading" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <!-- Completion -->
      <div class="glass-morphism rounded-xl border border-purple-500/20 p-4 flex flex-col items-center justify-center">
        <div class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-violet-300">
          {{ loading ? '…' : `${progress}%` }}
        </div>
        <div class="text-xs text-white/50 mt-1">Complete</div>
      </div>
      <!-- Commits -->
      <div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center">
        <div class="text-2xl font-bold text-white">
          {{ loading ? '…' : (repo?.size != null ? (gh?.recentCommits?.length ?? '—') : '—') }}
        </div>
        <div class="text-xs text-white/50 mt-1">Recent Commits</div>
      </div>
      <!-- Open Issues -->
      <div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center">
        <div class="text-2xl font-bold text-orange-300">{{ loading ? '…' : (repo?.open_issues_count ?? '—') }}</div>
        <div class="text-xs text-white/50 mt-1">Open Issues</div>
      </div>
      <!-- Merged PRs -->
      <div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center">
        <div class="text-2xl font-bold text-green-300">{{ loading ? '…' : (gh?.mergedPRs?.length ?? '—') }}</div>
        <div class="text-xs text-white/50 mt-1">Merged PRs</div>
      </div>
      <!-- Stars -->
      <div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center">
        <div class="text-2xl font-bold text-yellow-300">{{ loading ? '…' : (repo?.stargazers_count ?? '—') }}</div>
        <div class="text-xs text-white/50 mt-1">Stars</div>
      </div>
      <!-- Milestones -->
      <div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center">
        <div class="text-2xl font-bold text-blue-300">{{ loading ? '…' : (gh?.milestones?.length ?? timeline?.milestones?.length ?? '—') }}</div>
        <div class="text-xs text-white/50 mt-1">Milestones</div>
      </div>
      <!-- Contributors -->
      <div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center">
        <div class="text-2xl font-bold text-pink-300">{{ loading ? '…' : (gh?.contributors?.length ?? '—') }}</div>
        <div class="text-xs text-white/50 mt-1">Contributors</div>
      </div>
      <!-- Last Push -->
      <div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center">
        <div class="text-sm font-semibold text-white">{{ loading ? '…' : formatRelative(repo?.pushed_at ?? null) }}</div>
        <div class="text-xs text-white/50 mt-1">Last Push</div>
      </div>
    </div>

    <!-- No repo linked placeholder -->
    <div v-else-if="!timeline.githubRepo" class="glass-morphism rounded-xl border border-dashed border-white/20 p-12 text-center mb-4">
      <div class="text-4xl mb-3">🔗</div>
      <div class="text-white font-semibold mb-1">Connect a GitHub Repository</div>
      <div class="text-white/40 text-sm">Link this timeline to a GitHub repo to unlock live statistics, commit heatmaps, milestone tracking, and more.</div>
      <button v-if="adminMode" @click="linking = true; loadAllRepos()"
        class="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
        🔗 Link Repository
      </button>
    </div>

    <!-- ─── Inner Tabs (only shown when data is available) ───────────── -->
    <div v-if="gh || loading">
      <!-- Tab nav -->
      <div class="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 border border-white/10">
        <button v-for="(label, key) in { overview: '📊 Overview', milestones: '🏁 Milestones', activity: '📋 Activity', codestats: '📈 Code Stats' }"
          :key="key"
          @click="activeTab = key as any"
          :class="['flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all',
            activeTab === key ? 'bg-gradient-to-r from-purple-600/80 to-violet-600/80 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5']">
          {{ label }}
        </button>
      </div>

      <!-- ─── OVERVIEW TAB ─────────────────────────────────────────────── -->
      <div v-if="activeTab === 'overview'" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <!-- Completion Ring -->
          <div class="lg:col-span-2 glass-morphism rounded-xl border border-white/10 p-5 flex flex-col items-center justify-center gap-3">
            <div class="relative">
              <svg :width="RING_R*2+RING_STROKE*2+4" :height="RING_R*2+RING_STROKE*2+4">
                <!-- Background ring -->
                <circle
                  :cx="RING_R+RING_STROKE/2+2" :cy="RING_R+RING_STROKE/2+2"
                  :r="RING_R" fill="none"
                  stroke="rgba(255,255,255,0.08)" :stroke-width="RING_STROKE"
                />
                <!-- Progress ring -->
                <circle
                  :cx="RING_R+RING_STROKE/2+2" :cy="RING_R+RING_STROKE/2+2"
                  :r="RING_R" fill="none"
                  stroke="url(#ringGrad)" :stroke-width="RING_STROKE"
                  stroke-linecap="round"
                  :stroke-dasharray="`${ringDash} ${ringCircumference - ringDash}`"
                  stroke-dashoffset="0"
                  transform-origin="center"
                  style="transform: rotate(-90deg); transition: stroke-dasharray 0.8s ease"
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#7c3aed"/>
                    <stop offset="100%" stop-color="#a78bfa"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-white">{{ progress }}%</span>
                <span class="text-xs text-white/40">complete</span>
              </div>
            </div>

            <!-- Expected vs Actual -->
            <div v-if="timelineProgress" class="w-full text-xs">
              <div class="flex justify-between text-white/40 mb-1">
                <span>Expected</span><span>{{ timelineProgress.expected }}%</span>
              </div>
              <div class="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div class="h-full bg-white/30 rounded-full" :style="{ width: `${timelineProgress.expected}%` }" />
              </div>
              <div class="flex justify-between text-white/40 mb-1">
                <span>Actual</span><span>{{ timelineProgress.actual }}%</span>
              </div>
              <div class="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div class="h-full rounded-full transition-all"
                  :class="timelineProgress.isAhead ? 'bg-green-500' : 'bg-orange-500'"
                  :style="{ width: `${timelineProgress.actual}%` }" />
              </div>
              <div :class="['text-center font-semibold', timelineProgress.isAhead ? 'text-green-400' : 'text-orange-400']">
                {{ timelineProgress.isAhead ? '✅ Ahead of schedule' : '⚠️ Behind schedule' }}
                ({{ Math.abs(timelineProgress.diff) }}%)
              </div>
            </div>

            <!-- Repo meta -->
            <div v-if="repo" class="w-full space-y-1 text-xs text-white/50 border-t border-white/10 pt-3">
              <div class="flex justify-between"><span>Created</span><span>{{ formatDate(repo.created_at) }}</span></div>
              <div class="flex justify-between"><span>Size</span><span>{{ formatBytes(repo.size * 1024) }}</span></div>
              <div class="flex justify-between"><span>Branch</span><span class="text-purple-400">{{ repo.default_branch }}</span></div>
            </div>
          </div>

          <!-- Language Donut -->
          <div class="lg:col-span-3 glass-morphism rounded-xl border border-white/10 p-5">
            <h4 class="text-sm font-semibold text-white mb-4">Tech Stack</h4>
            <div v-if="!languageData.length" class="text-white/30 text-sm text-center py-4">No language data</div>
            <div v-else class="flex items-center gap-6">
              <!-- SVG Donut -->
              <svg :width="DONUT_CX*2" :height="DONUT_CY*2" class="flex-shrink-0">
                <circle :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R" fill="none" stroke="rgba(255,255,255,0.05)" :stroke-width="DONUT_STROKE"/>
                <circle
                  v-for="(arc, i) in donutArcs" :key="i"
                  :cx="DONUT_CX" :cy="DONUT_CY" :r="DONUT_R"
                  fill="none" :stroke="arc.color" :stroke-width="DONUT_STROKE"
                  stroke-linecap="butt"
                  :stroke-dasharray="`${arc.dash} ${arc.gap}`"
                  :stroke-dashoffset="-arc.offset"
                  style="transform: rotate(-90deg); transform-origin: 50% 50%;"
                />
              </svg>
              <!-- Legend -->
              <div class="flex-1 space-y-2">
                <div v-for="lang in languageData" :key="lang.name" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: lang.color }" />
                    <span class="text-sm text-white/80">{{ lang.name }}</span>
                  </div>
                  <span class="text-xs text-white/50 font-mono">{{ lang.pct }}%</span>
                </div>
              </div>
            </div>

            <!-- Repo description -->
            <div v-if="repo?.description" class="mt-4 text-xs text-white/50 border-t border-white/10 pt-3 italic">
              "{{ repo.description }}"
            </div>
          </div>
        </div>

        <!-- Commit Heatmap (full width) -->
        <div class="glass-morphism rounded-xl border border-white/10 p-5">
          <h4 class="text-sm font-semibold text-white mb-4">Commit Activity</h4>
          <CommitHeatmap :data="gh?.commitActivity ?? null" :loading="loading" />
        </div>
      </div>

      <!-- ─── MILESTONES TAB ────────────────────────────────────────────── -->
      <div v-if="activeTab === 'milestones'" class="space-y-4">
        <!-- GitHub milestones -->
        <div v-if="gh?.milestones?.length">
          <h4 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">GitHub Milestones</h4>
          <div class="space-y-3">
            <div v-for="m in gh.milestones" :key="m.number"
              class="glass-morphism rounded-xl border border-white/10 p-4">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div>
                  <a :href="m.html_url" target="_blank"
                    class="font-semibold text-white hover:text-purple-400 transition-colors">
                    {{ m.title }}
                  </a>
                  <div v-if="m.description" class="text-xs text-white/40 mt-1">{{ m.description }}</div>
                </div>
                <span :class="['text-xs px-2 py-1 rounded-full border font-semibold flex-shrink-0',
                  m.state === 'closed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30']">
                  {{ m.state === 'closed' ? '✅ Closed' : '🔧 Open' }}
                </span>
              </div>
              <!-- Progress bar -->
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full transition-all"
                    :style="{ width: `${m.open_issues + m.closed_issues > 0 ? Math.round(m.closed_issues / (m.open_issues + m.closed_issues) * 100) : 0}%` }" />
                </div>
                <span class="text-xs text-white/50 flex-shrink-0 font-mono">
                  {{ m.closed_issues }}/{{ m.open_issues + m.closed_issues }} issues
                </span>
              </div>
              <div v-if="m.due_on" class="text-xs text-white/40 mt-2">📅 Due: {{ formatDate(m.due_on) }}</div>
            </div>
          </div>
        </div>

        <!-- Our DB milestones (with Gantt bars) -->
        <div v-if="timeline?.milestones?.length">
          <h4 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Project Milestones</h4>
          <!-- Gantt chart -->
          <div class="glass-morphism rounded-xl border border-white/10 p-4 mb-3 overflow-x-auto">
            <div class="min-w-[500px]">
              <div v-for="m in timeline.milestones" :key="m.id" class="flex items-center gap-3 mb-2">
                <div class="w-36 text-xs text-white/60 truncate flex-shrink-0">{{ m.title }}</div>
                <div class="flex-1 relative h-6">
                  <!-- Gantt bar -->
                  <div class="absolute inset-0 bg-white/5 rounded">
                    <div :class="['absolute top-0 h-full rounded transition-all',
                      m.status === 'COMPLETED' ? 'bg-gradient-to-r from-green-600/70 to-green-500/70' :
                      m.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-purple-600/80 to-violet-500/80' :
                      m.status === 'DELAYED' ? 'bg-gradient-to-r from-orange-600/70 to-orange-500/70' :
                      'bg-white/10']"
                      style="left: 0; width: 100%"
                    />
                  </div>
                  <div class="absolute inset-0 flex items-center px-2 text-xs text-white/70 truncate">
                    {{ formatDate(m.startDate) }} → {{ formatDate(m.endDate) }}
                  </div>
                </div>
                <span :class="['text-xs px-2 py-0.5 rounded-full border flex-shrink-0', milestoneStatusClass(m.status)]">
                  {{ m.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!gh?.milestones?.length && !timeline?.milestones?.length" class="text-center py-8 text-white/30">
          No milestones defined yet
        </div>
      </div>

      <!-- ─── ACTIVITY TAB ──────────────────────────────────────────────── -->
      <div v-if="activeTab === 'activity'" class="space-y-4">
        <!-- Weekly bar chart -->
        <div class="glass-morphism rounded-xl border border-white/10 p-5">
          <h4 class="text-sm font-semibold text-white mb-4">Weekly Commits (Last 12 Weeks)</h4>
          <div v-if="weeklyBars.length" class="flex items-end gap-1 h-24">
            <div v-for="bar in weeklyBars" :key="bar.index"
              class="flex-1 flex flex-col items-center gap-1 group relative cursor-default">
              <div class="absolute bottom-6 bg-gray-900/90 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {{ bar.total }} commits · {{ bar.label }}
              </div>
              <div
                class="w-full rounded-t-sm bg-gradient-to-t from-purple-700 to-violet-500 transition-all duration-500"
                :style="{ height: `${bar.height}px` }"
              />
            </div>
          </div>
          <div v-else class="text-white/30 text-sm text-center py-4">Loading…</div>
        </div>

        <!-- Recent commits feed -->
        <div class="glass-morphism rounded-xl border border-white/10 p-5">
          <h4 class="text-sm font-semibold text-white mb-4">Recent Commits</h4>
          <div v-if="!gh?.recentCommits?.length" class="text-white/30 text-sm text-center py-4">
            {{ loading ? 'Loading…' : 'No commits found' }}
          </div>
          <div v-else class="space-y-3">
            <div v-for="c in gh.recentCommits.slice(0, 15)" :key="c.sha"
              class="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <img v-if="c.author?.avatar_url" :src="c.author.avatar_url" :alt="c.author.login"
                class="w-7 h-7 rounded-full flex-shrink-0 border border-white/10" />
              <div v-else class="w-7 h-7 rounded-full bg-purple-700/50 flex-shrink-0 flex items-center justify-center text-xs text-white/60">
                {{ c.commit.author.name[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-white/80 leading-snug">{{ truncate(c.commit.message.split('\n')[0], 80) }}</div>
                <div class="flex items-center gap-3 mt-1 text-xs text-white/35">
                  <span>{{ c.author?.login ?? c.commit.author.name }}</span>
                  <span>{{ formatRelative(c.commit.author.date) }}</span>
                  <a :href="c.html_url" target="_blank"
                    class="font-mono hover:text-purple-400 transition-colors">
                    {{ c.sha.substring(0, 7) }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Releases -->
        <div v-if="gh?.releases?.length" class="glass-morphism rounded-xl border border-white/10 p-5">
          <h4 class="text-sm font-semibold text-white mb-4">Releases</h4>
          <div class="space-y-2">
            <div v-for="r in gh.releases.slice(0, 6)" :key="r.tag_name"
              class="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div class="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm flex-shrink-0">🏷</div>
              <div class="flex-1 min-w-0">
                <a :href="r.html_url" target="_blank"
                  class="text-sm font-semibold text-white hover:text-purple-400 transition-colors">
                  {{ r.name || r.tag_name }}
                </a>
                <div class="text-xs text-white/40">{{ formatDate(r.published_at) }}</div>
              </div>
              <span v-if="r.prerelease" class="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">pre-release</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── CODE STATS TAB ────────────────────────────────────────────── -->
      <div v-if="activeTab === 'codestats'" class="space-y-4">
        <!-- Code frequency area chart -->
        <div class="glass-morphism rounded-xl border border-white/10 p-5">
          <h4 class="text-sm font-semibold text-white mb-1">Code Frequency</h4>
          <div class="flex gap-4 text-xs text-white/40 mb-4">
            <span class="flex items-center gap-1"><span class="w-3 h-1 bg-purple-500 inline-block rounded" /> Additions</span>
            <span class="flex items-center gap-1"><span class="w-3 h-1 bg-pink-500/60 inline-block rounded" /> Deletions</span>
          </div>
          <div v-if="!gh?.codeFrequency" class="text-white/30 text-sm text-center py-8">
            {{ loading ? 'Loading…' : 'No code frequency data (GitHub may still be computing)' }}
          </div>
          <div v-else class="relative">
            <svg width="100%" :height="120" viewBox="0 0 600 120" preserveAspectRatio="none" class="block">
              <defs>
                <linearGradient id="addGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.8"/>
                  <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.1"/>
                </linearGradient>
                <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ec4899" stop-opacity="0.6"/>
                  <stop offset="100%" stop-color="#ec4899" stop-opacity="0.05"/>
                </linearGradient>
              </defs>
              <!-- Additions area -->
              <path
                :d="svgAreaPath(codeFreqData.adds, codeFreqData.maxVal, 600, 120)"
                fill="url(#addGrad)" stroke="#7c3aed" stroke-width="1.5"
              />
              <!-- Deletions area (flipped) -->
              <path
                :d="svgAreaPath(codeFreqData.dels, codeFreqData.maxVal, 600, 120, true)"
                fill="url(#delGrad)" stroke="#ec4899" stroke-width="1"
              />
            </svg>
          </div>
        </div>

        <!-- Contributors leaderboard -->
        <div class="glass-morphism rounded-xl border border-white/10 p-5">
          <h4 class="text-sm font-semibold text-white mb-4">Contributors</h4>
          <div v-if="!gh?.contributors" class="text-white/30 text-sm text-center py-4">
            {{ loading ? 'Computing…' : 'No contributor data yet' }}
          </div>
          <div v-else class="space-y-3">
            <div v-for="(c, i) in [...(gh.contributors ?? [])].sort((a: any, b: any) => b.total - a.total).slice(0, 10)" :key="i"
              class="flex items-center gap-3">
              <div class="w-6 text-xs text-white/30 text-right flex-shrink-0">{{ i + 1 }}</div>
              <img :src="c.author?.avatar_url" :alt="c.author?.login"
                class="w-7 h-7 rounded-full border border-white/10 flex-shrink-0" />
              <a :href="c.author?.html_url" target="_blank"
                class="text-sm text-white hover:text-purple-400 transition-colors flex-1 truncate">
                {{ c.author?.login }}
              </a>
              <div class="flex items-center gap-2">
                <div class="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-400"
                  :style="{ width: `${Math.max(20, Math.round((c.total / (gh.contributors[0]?.total || 1)) * 120))}px` }" />
                <span class="text-xs text-white/50 font-mono w-12 text-right">{{ c.total.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PRs summary -->
        <div v-if="gh?.pullRequests?.length" class="glass-morphism rounded-xl border border-white/10 p-5">
          <h4 class="text-sm font-semibold text-white mb-4">Pull Requests</h4>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-300">{{ gh.mergedPRs?.length }}</div>
              <div class="text-xs text-white/40">Merged</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-300">{{ gh.pullRequests.filter((p: any) => p.state === 'open').length }}</div>
              <div class="text-xs text-white/40">Open</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white/50">{{ gh.pullRequests.filter((p: any) => p.state === 'closed' && !p.merged_at).length }}</div>
              <div class="text-xs text-white/40">Closed</div>
            </div>
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div v-for="pr in gh.pullRequests.slice(0, 8)" :key="pr.number"
              class="flex items-center gap-2 text-xs p-2 rounded bg-white/5">
              <span :class="pr.merged_at ? 'text-green-400' : pr.state === 'open' ? 'text-blue-400' : 'text-white/30'">
                {{ pr.merged_at ? '🔀' : pr.state === 'open' ? '🔧' : '✕' }}
              </span>
              <a :href="pr.html_url" target="_blank" class="flex-1 text-white/70 hover:text-white truncate">
                #{{ pr.number }} {{ pr.title }}
              </a>
              <span class="text-white/30 flex-shrink-0">{{ formatRelative(pr.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
