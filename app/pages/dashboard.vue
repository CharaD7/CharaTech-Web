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

      <div
        class="glass-morphism p-8 rounded-xl cursor-pointer hover:scale-105 transition-transform"
        @click="activeTab = 'invoices'"
      >
        <div class="text-6xl mb-4">🧾</div>
        <h2 class="text-2xl font-bold text-white mb-2">Invoices</h2>
        <p class="text-3xl font-bold text-pink-400">{{ invoices.length }}</p>
        <p class="text-white/50 text-sm mt-1">
          <span v-if="unpaidCount > 0" class="text-yellow-400">{{ unpaidCount }} awaiting payment</span>
          <span v-else class="text-emerald-400">All settled ✓</span>
        </p>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="mb-6">
      <div class="flex gap-2 bg-white/5 p-1.5 rounded-xl inline-flex">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all',
            activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          ]"
        >
          <span class="mr-1.5">{{ tab.icon }}</span>{{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ── SUBMISSIONS TAB ── -->
    <div v-if="activeTab === 'submissions'">
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
            <button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition">
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
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(submission.status)]">
                {{ submission.status }}
              </span>
            </div>
            <div class="grid md:grid-cols-3 gap-4 text-sm text-white/70 mb-4">
              <div><span class="font-medium text-white">Complexity:</span> {{ submission.complexity }}</div>
              <div><span class="font-medium text-white">Budget:</span> {{ submission.budget || 'Not specified' }}</div>
              <div><span class="font-medium text-white">Submitted:</span> {{ formatDate(submission.createdAt) }}</div>
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

    <!-- ── INVOICES TAB ── -->
    <div v-if="activeTab === 'invoices'">
      <div class="glass-morphism p-6 rounded-xl border border-white/10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">My Invoices</h2>
          <button
            @click="fetchInvoices"
            class="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition"
          >
            Refresh
          </button>
        </div>

        <!-- Loading -->
        <div v-if="invoicesLoading" class="text-center py-12">
          <svg class="animate-spin h-10 w-10 text-purple-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p class="text-white/50 mt-3">Loading invoices...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="invoices.length === 0" class="text-center py-16">
          <div class="text-5xl mb-4">🧾</div>
          <p class="text-white/40 text-lg">No invoices yet</p>
          <p class="text-white/25 text-sm mt-1">Invoices created by CharaTech will appear here</p>
        </div>

        <!-- Invoice Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/5">
              <tr>
                <th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider">Invoice #</th>
                <th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider">Project</th>
                <th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider">Amount</th>
                <th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider">Status</th>
                <th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider">Due</th>
                <th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="inv in invoices"
                :key="inv.id"
                class="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td class="px-5 py-4 font-mono text-sm text-purple-300 font-medium">{{ inv.invoiceNumber }}</td>
                <td class="px-5 py-4">
                  <div class="text-white text-sm">{{ inv.submission?.projectName || '—' }}</div>
                  <div class="text-white/40 text-xs">{{ inv.submission?.industry }}</div>
                </td>
                <td class="px-5 py-4 text-white font-semibold tabular-nums">
                  {{ currencySymbol(inv.currency) }}{{ Number(inv.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  <span class="text-white/30 text-xs ml-1">{{ inv.currency }}</span>
                </td>
                <td class="px-5 py-4">
                  <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getInvoiceStatusClass(inv.status)]">
                    {{ inv.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-white/60 text-sm">
                  <span v-if="inv.dueDate" :class="isOverdue(inv) ? 'text-red-400' : ''">
                    {{ formatDate(inv.dueDate) }}
                  </span>
                  <span v-else class="text-white/30">—</span>
                </td>
                <td class="px-5 py-4">
                  <button
                    v-if="inv.status !== 'DRAFT'"
                    @click="viewInvoice(inv)"
                    class="px-3 py-1.5 text-xs rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition border border-purple-500/20"
                  >
                    View
                  </button>
                  <span v-else class="text-white/20 text-xs italic">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Timeline Tab -->
    <div v-if="activeTab === 'timeline'">
      <div v-if="timelinesLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 2" :key="i" class="h-48 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div v-else-if="!clientTimelines.length" class="glass-morphism rounded-2xl border border-white/10 p-12 text-center">
        <div class="text-5xl mb-4">📅</div>
        <h3 class="text-lg font-bold text-white mb-2">No Active Timelines</h3>
        <p class="text-white/40 text-sm">Once your project is approved and underway, you'll see live progress, milestones, and activity here.</p>
      </div>
      <div v-else>
        <!-- Project selector (if multiple) -->
        <div v-if="clientTimelines.length > 1" class="flex gap-2 mb-4 flex-wrap">
          <button
            v-for="t in clientTimelines"
            :key="t.id"
            @click="selectedClientTimeline = t"
            :class="['px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
              (selectedClientTimeline ?? clientTimelines[0]).id === t.id
                ? 'bg-purple-600/30 border-purple-500/40 text-white'
                : 'bg-white/5 border-transparent text-white/50 hover:text-white']"
          >
            {{ t.projectName }}
          </button>
        </div>

        <!-- Timeline detail -->
        <div v-for="t in [selectedClientTimeline ?? clientTimelines[0]]" :key="t.id" class="space-y-4">
          <!-- Header card -->
          <div class="glass-morphism rounded-2xl border border-white/10 p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-xl font-bold text-white">{{ t.projectName }}</h3>
                <div v-if="t.githubRepo" class="text-sm text-purple-400 mt-0.5">
                  🔗 <a :href="`https://github.com/${t.githubRepo}`" target="_blank" class="hover:underline">{{ t.githubRepo }}</a>
                </div>
              </div>
              <div :class="['px-3 py-1 rounded-full text-xs font-bold',
                t.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                t.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                t.status === 'ON_HOLD' ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-white/50']">
                {{ t.status }}
              </div>
            </div>

            <!-- Progress bar -->
            <div class="mb-3">
              <div class="flex justify-between text-xs text-white/50 mb-1.5">
                <span>Overall Progress</span>
                <span class="font-bold text-purple-400">{{ t.progress }}%</span>
              </div>
              <div class="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full transition-all duration-700 relative"
                  :style="{ width: `${t.progress}%` }"
                >
                  <div class="absolute inset-0 bg-white/20 animate-pulse rounded-full" v-if="t.status === 'ACTIVE'" />
                </div>
              </div>
            </div>

            <!-- Timeline dates -->
            <div v-if="t.startDate || t.endDate" class="flex gap-4 text-xs text-white/40">
              <span v-if="t.startDate">🚀 Started: {{ new Date(t.startDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) }}</span>
              <span v-if="t.endDate">🏁 Target: {{ new Date(t.endDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) }}</span>
            </div>
          </div>

          <!-- Milestones -->
          <div v-if="t.milestones?.length" class="glass-morphism rounded-2xl border border-white/10 p-6">
            <h4 class="text-sm font-bold text-white mb-4">Project Milestones</h4>
            <div class="space-y-3">
              <div v-for="m in t.milestones" :key="m.id"
                class="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0',
                  m.status === 'COMPLETED' ? 'bg-green-500/20' :
                  m.status === 'IN_PROGRESS' ? 'bg-blue-500/20' :
                  m.status === 'DELAYED' ? 'bg-orange-500/20' : 'bg-white/10']">
                  {{ m.status === 'COMPLETED' ? '✅' : m.status === 'IN_PROGRESS' ? '🔧' : m.status === 'DELAYED' ? '⚠️' : '⏳' }}
                </div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-white">{{ m.title }}</div>
                  <div v-if="m.description" class="text-xs text-white/40 mt-0.5">{{ m.description }}</div>
                  <div class="text-xs text-white/30 mt-1">
                    {{ new Date(m.startDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) }}
                    → {{ new Date(m.endDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) }}
                  </div>
                </div>
                <span :class="['text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                  m.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                  m.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                  m.status === 'DELAYED' ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-white/40']">
                  {{ m.status.replace('_', ' ') }}
                </span>
              </div>
            </div>
          </div>

          <!-- GitHub milestones (if linked) -->
          <div v-if="t.github?.milestones?.length" class="glass-morphism rounded-2xl border border-white/10 p-6">
            <h4 class="text-sm font-bold text-white mb-4">GitHub Milestones</h4>
            <div class="space-y-3">
              <div v-for="m in t.github.milestones" :key="m.number" class="p-3 rounded-xl bg-white/5">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-white">{{ m.title }}</span>
                  <span :class="['text-xs px-2 py-0.5 rounded-full',
                    m.state === 'closed' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300']">
                    {{ m.state === 'closed' ? '✅ Done' : '🔧 Active' }}
                  </span>
                </div>
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full"
                    :style="{ width: `${ m.open_issues + m.closed_issues > 0 ? Math.round(m.closed_issues / (m.open_issues + m.closed_issues) * 100) : 0 }%` }" />
                </div>
                <div class="text-xs text-white/30 mt-1">{{ m.closed_issues }}/{{ m.open_issues + m.closed_issues }} tasks completed</div>
              </div>
            </div>
          </div>

          <!-- Recent activity (commits) -->
          <div v-if="t.github?.recentCommits?.length" class="glass-morphism rounded-2xl border border-white/10 p-6">
            <h4 class="text-sm font-bold text-white mb-4">Recent Development Activity</h4>
            <div class="space-y-2">
              <div v-for="c in t.github.recentCommits" :key="c.sha"
                class="flex items-start gap-3 p-2.5 rounded-lg bg-white/5">
                <img v-if="c.avatar" :src="c.avatar" :alt="c.author" class="w-6 h-6 rounded-full flex-shrink-0 border border-white/10 mt-0.5" />
                <div class="w-6 h-6 rounded-full bg-purple-700/40 flex items-center justify-center text-xs flex-shrink-0 mt-0.5" v-else>
                  {{ c.author?.[0] }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-white/70 leading-snug">{{ c.message }}</div>
                  <div class="text-xs text-white/30 mt-0.5">{{ c.author }} · <a :href="c.url" target="_blank" class="font-mono hover:text-purple-400">{{ c.sha }}</a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Invoice View Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="selectedInvoice" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="selectedInvoice = null" />
        <div
          class="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border border-purple-500/20"
          style="background: linear-gradient(135deg, rgba(12,8,32,0.98) 0%, rgba(22,8,48,0.98) 100%); box-shadow: 0 0 80px rgba(168,85,247,0.12), 0 0 40px rgba(0,0,0,0.8);"
        >
          <!-- Header -->
          <div
            class="flex-shrink-0 flex items-center justify-between px-7 py-5 border-b border-purple-500/20"
            style="background: linear-gradient(90deg, rgba(88,28,135,0.6) 0%, rgba(190,24,93,0.3) 100%);"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: linear-gradient(135deg,#7c3aed,#db2777);">🧾</div>
              <div>
                <div class="font-bold text-white">{{ selectedInvoice.invoiceNumber }}</div>
                <div class="text-white/50 text-xs">{{ selectedInvoice.submission?.projectName }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getInvoiceStatusClass(selectedInvoice.status)]">
                {{ selectedInvoice.status }}
              </span>
              <button @click="selectedInvoice = null" class="text-white/40 hover:text-white text-2xl leading-none transition">×</button>
            </div>
          </div>

          <!-- Body -->
          <GlowingScrollbar class="flex-1 p-7 space-y-5"></GlowingScrollbar>
            <!-- Due Date + Amount -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <div class="text-white/40 text-xs uppercase tracking-wider mb-1">Due Date</div>
                <div :class="['font-semibold', isOverdue(selectedInvoice) ? 'text-red-400' : 'text-white']">
                  {{ selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : 'Upon receipt' }}
                </div>
              </div>
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <div class="text-white/40 text-xs uppercase tracking-wider mb-1">Total Amount</div>
                <div class="text-2xl font-bold text-purple-300">
                  {{ currencySymbol(selectedInvoice.currency) }}{{ Number(selectedInvoice.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  <span class="text-white/30 text-sm">{{ selectedInvoice.currency }}</span>
                </div>
              </div>
            </div>

            <!-- Line Items -->
            <div>
              <div class="text-white/40 text-xs uppercase tracking-wider mb-3">Line Items</div>
              <div class="space-y-1.5">
                <div
                  v-for="(item, i) in (selectedInvoice.items || [])"
                  :key="i"
                  class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                >
                  <div class="flex-1 text-white text-sm">{{ item.description }}</div>
                  <div class="text-white/40 text-xs tabular-nums w-10 text-center">×{{ item.quantity }}</div>
                  <div class="text-purple-300 font-semibold text-sm tabular-nums">
                    {{ currencySymbol(selectedInvoice.currency) }}{{ Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="border border-white/10 rounded-xl overflow-hidden">
              <div class="flex justify-between px-4 py-2.5 text-sm">
                <span class="text-white/60">Subtotal</span>
                <span class="text-white tabular-nums">{{ currencySymbol(selectedInvoice.currency) }}{{ Number(selectedInvoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div v-if="selectedInvoice.taxAmount" class="flex justify-between px-4 py-2.5 text-sm border-t border-white/10">
                <span class="text-white/60">Tax / Levy</span>
                <span class="text-purple-300 tabular-nums">{{ currencySymbol(selectedInvoice.currency) }}{{ Number(selectedInvoice.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
              <div class="flex justify-between px-4 py-3 bg-purple-500/10 border-t border-purple-500/20">
                <span class="font-bold text-white">Total Due</span>
                <span class="font-bold text-pink-300 text-lg tabular-nums">{{ currencySymbol(selectedInvoice.currency) }}{{ Number(selectedInvoice.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="selectedInvoice.notes" class="bg-white/5 rounded-xl p-4 border border-white/10">
              <div class="text-white/40 text-xs uppercase tracking-wider mb-2">Notes</div>
              <p class="text-white/70 text-sm leading-relaxed">{{ selectedInvoice.notes }}</p>
            </div>

            <!-- Contact CTA -->
            <div class="text-center pt-2">
              <p class="text-white/40 text-xs mb-3">Questions about this invoice?</p>
              <a
                href="mailto:hello@charatech.com"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition"
                style="background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(219,39,119,0.3)); border: 1px solid rgba(168,85,247,0.3);"
              >
                ✉️ Contact CharaTech
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Submission } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const userStore = useUserStore()
const { user, getAccessToken } = useAuth()

// Redirect admins to admin dashboard
if (userStore.currentUser?.role === 'ADMIN') {
  await navigateTo('/admin/dashboard')
}

const activeTab = ref('submissions')
const tabs = [
  { id: 'submissions', label: 'Submissions', icon: '📋' },
  { id: 'invoices', label: 'Invoices', icon: '🧾' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
]

// ── Submissions ──────────────────────────────────────────────
const submissions = ref<Submission[]>([])
const loading = ref(true)

const fetchSubmissions = async () => {
  if (!user.value) return
  try {
    const token = await getAccessToken()
    if (!token) return
    const data = await $fetch<Submission[]>('/api/submissions', {
      headers: { Authorization: `Bearer ${token}` },
    })
    submissions.value = data
  } catch (error) {
    console.error('Failed to fetch submissions:', error)
  } finally {
    loading.value = false
  }
}

// ── Invoices ─────────────────────────────────────────────────
const invoices = ref<any[]>([])
const invoicesLoading = ref(false)
const selectedInvoice = ref<any>(null)

const fetchInvoices = async () => {
  invoicesLoading.value = true
  try {
    const token = await getAccessToken()
    if (!token) return
    const data = await $fetch<{ success: boolean; invoices: any[] }>('/api/invoices', {
      headers: { Authorization: `Bearer ${token}` },
    })
    invoices.value = data.invoices ?? []
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
  } finally {
    invoicesLoading.value = false
  }
}

const viewInvoice = (inv: any) => { selectedInvoice.value = inv }

const unpaidCount = computed(() =>
  invoices.value.filter((i) => ['SENT', 'OVERDUE'].includes(i.status)).length
)

const isOverdue = (inv: any) =>
  inv.status === 'OVERDUE' || (inv.status === 'SENT' && inv.dueDate && new Date(inv.dueDate) < new Date())

onMounted(() => {
  fetchSubmissions()
  fetchInvoices()
  fetchTimelines()
})

// ── Project Timelines ─────────────────────────────────────────
const clientTimelines = ref<any[]>([])
const timelinesLoading = ref(false)

const fetchTimelines = async () => {
  timelinesLoading.value = true
  try {
    const token = await getAccessToken()
    if (!token) return
    clientTimelines.value = await $fetch<any[]>('/api/timelines', {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (e) {
    console.error('Failed to fetch timelines:', e)
  } finally {
    timelinesLoading.value = false
  }
}

const selectedClientTimeline = ref<any>(null)

// ── Helpers ───────────────────────────────────────────────────
const currencySymbol = (currency: string) =>
  ({ USD: '$', EUR: '€', GBP: '£', GHS: '₵', CAD: 'C$', AUD: 'A$' }[currency] ?? '$')

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

const getInvoiceStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    DRAFT: 'bg-gray-500/20 text-gray-300',
    SENT: 'bg-blue-500/20 text-blue-300',
    PAID: 'bg-emerald-500/20 text-emerald-300',
    OVERDUE: 'bg-red-500/20 text-red-300',
    CANCELLED: 'bg-gray-500/20 text-gray-400',
  }
  return classes[status] || 'bg-gray-500/20 text-gray-300'
}

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
</script>

<style scoped>
.modal-enter-active { animation: modal-in 0.3s cubic-bezier(0.34,1.4,0.64,1); }
.modal-leave-active { animation: modal-in 0.2s ease-in reverse; }
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}
</style>
