<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
      <!-- Admin Header -->
      <div class="mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-xl border-l-4 border-purple-500 glass-morphism">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-3xl">🛡️</span>
              <h1 class="text-4xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p class="text-white/80 text-lg">Manage submissions, communicate with clients, and track projects</p>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="mb-6">
        <div class="flex gap-2 bg-white/5 p-2 rounded-xl inline-flex">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition-all',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            ]"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <div class="glass-morphism p-6 rounded-xl border border-white/10">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white">Registered Users</h3>
            <span class="text-white/60">{{ users.length }} users</span>
          </div>

          <div v-if="selectedUserDetail" class="space-y-6">
            <button @click="selectedUserDetail = null" class="text-purple-400 hover:text-purple-300 text-sm">
              ← Back to list
            </button>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="text-lg font-semibold text-white">User Details</h4>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-white/60">Full Name</span>
                    <span class="text-white">{{ selectedUserDetail.fullName || '—' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60">Email</span>
                    <span class="text-white">{{ selectedUserDetail.email }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60">Phone</span>
                    <span class="text-white">{{ selectedUserDetail.phoneNumber || '—' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60">Company</span>
                    <span class="text-white">{{ selectedUserDetail.companyName || '—' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60">Role</span>
                    <span :class="['px-2 py-0.5 rounded text-xs font-semibold',
                      selectedUserDetail.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300']">
                      {{ selectedUserDetail.role }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60">Email Verified</span>
                    <span :class="selectedUserDetail.emailVerified ? 'text-green-400' : 'text-red-400'">
                      {{ selectedUserDetail.emailVerified ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60">Phone Verified</span>
                    <span :class="selectedUserDetail.phoneVerified ? 'text-green-400' : 'text-red-400'">
                      {{ selectedUserDetail.phoneVerified ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/60">Joined</span>
                    <span class="text-white">{{ formatDate(selectedUserDetail.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button
                  @click="verifyUserEmail(selectedUserDetail)"
                  :disabled="selectedUserDetail.emailVerified || verifyingEmail"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>✓</span> Verify Email
                </button>
                <button
                  @click="generateAuthLink(selectedUserDetail)"
                  :disabled="generatingLink"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span v-if="generatingLink">⏳</span><span v-else>🔗</span> Generate Auth Link
                </button>
                <button
                  @click="deleteUser(selectedUserDetail)"
                  :disabled="deletingUser"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span v-if="deletingUser">⏳</span><span v-else>🗑️</span> Delete User
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-white">Statistics</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/5 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-white">{{ selectedUserDetail._count?.submissions || 0 }}</div>
                  <div class="text-white/60 text-sm">Submissions</div>
                </div>
                <div class="bg-white/5 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-white">{{ selectedUserDetail._count?.notifications || 0 }}</div>
                  <div class="text-white/60 text-sm">Notifications</div>
                </div>
                <div class="bg-white/5 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-white">{{ selectedUserDetail._count?.calendlyBookings || 0 }}</div>
                  <div class="text-white/60 text-sm">Bookings</div>
                </div>
              </div>
            </div>

            <div v-if="selectedUserDetail.submissions?.length" class="space-y-4">
              <h4 class="text-lg font-semibold text-white">Recent Submissions</h4>
              <div class="space-y-2">
                <div v-for="sub in selectedUserDetail.submissions" :key="sub.id"
                  class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div class="text-white font-medium">{{ sub.projectName }}</div>
                    <div class="text-white/40 text-xs">{{ formatDate(sub.createdAt) }}</div>
                  </div>
                  <span :class="['px-2 py-1 rounded text-xs font-semibold', getStatusClass(sub.status)]">
                    {{ sub.status }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="selectedUserDetail.notifications?.length" class="space-y-4">
              <h4 class="text-lg font-semibold text-white">Recent Notifications</h4>
              <div class="space-y-2">
                <div v-for="notif in selectedUserDetail.notifications" :key="notif.id"
                  class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div class="text-white font-medium">{{ notif.subject }}</div>
                    <div class="text-white/40 text-xs">{{ formatDate(notif.createdAt) }}</div>
                  </div>
                  <span :class="notif.read ? 'text-green-400' : 'text-yellow-400'">
                    {{ notif.read ? 'Read' : 'Unread' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-white/5">
                  <tr>
                    <th class="px-4 py-3 text-left text-white/60 text-xs uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-white/60 text-xs uppercase">Email</th>
                    <th class="px-4 py-3 text-left text-white/60 text-xs uppercase">Company</th>
                    <th class="px-4 py-3 text-left text-white/60 text-xs uppercase">Submissions</th>
                    <th class="px-4 py-3 text-left text-white/60 text-xs uppercase">Joined</th>
                    <th class="px-4 py-3 text-left text-white/60 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id"
                    class="border-t border-white/10 hover:bg-white/5 transition cursor-pointer"
                    @click="viewUser(user)">
                    <td class="px-4 py-4 text-white">{{ user.fullName || '—' }}</td>
                    <td class="px-4 py-4 text-white/80">{{ user.email }}</td>
                    <td class="px-4 py-4 text-white/80">{{ user.companyName || '—' }}</td>
                    <td class="px-4 py-4 text-white/80">{{ user._count?.submissions || 0 }}</td>
                    <td class="px-4 py-4 text-white/60 text-sm">{{ formatDate(user.createdAt) }}</td>
                    <td class="px-4 py-4" @click.stop>
                      <button @click="viewUser(user)"
                        class="px-3 py-1.5 text-xs rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div v-if="activeTab === 'overview'" class="grid md:grid-cols-4 gap-6 mb-8">
        <div 
          v-for="stat in stats" 
          :key="stat.label"
          class="glass-morphism p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer border border-white/10"
        >
          <div class="text-4xl mb-3">{{ stat.icon }}</div>
          <div class="text-4xl font-bold text-white mb-2">{{ stat.value }}</div>
          <div class="text-white/70">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Submissions Tab -->
      <div v-if="activeTab === 'submissions'" class="space-y-6">
        <!-- Filters -->
        <div class="glass-morphism p-6 rounded-xl border border-white/10">
          <div class="grid md:grid-cols-4 gap-4">
            <input
              v-model="search"
              type="text"
              placeholder="Search submissions..."
              class="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            
            <select
              v-model="filters.status"
              class="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none transition"
            >
              <option value="" class="bg-gray-900">All Status</option>
              <option value="PENDING" class="bg-gray-900">Pending</option>
              <option value="REVIEWING" class="bg-gray-900">Reviewing</option>
              <option value="QUOTED" class="bg-gray-900">Quoted</option>
              <option value="ACCEPTED" class="bg-gray-900">Accepted</option>
              <option value="IN_PROGRESS" class="bg-gray-900">In Progress</option>
              <option value="COMPLETED" class="bg-gray-900">Completed</option>
            </select>

            <select
              v-model="filters.industry"
              class="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none transition"
            >
              <option value="" class="bg-gray-900">All Industries</option>
              <option value="HEALTHCARE" class="bg-gray-900">Healthcare</option>
              <option value="FINANCE" class="bg-gray-900">Finance</option>
              <option value="ECOMMERCE" class="bg-gray-900">E-commerce</option>
              <option value="EDUCATION" class="bg-gray-900">Education</option>
              <option value="TECHNOLOGY" class="bg-gray-900">Technology</option>
            </select>

            <button
              @click="exportData"
              class="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2"
            >
              <span>📥</span>
              Export CSV
            </button>
          </div>
        </div>

        <!-- Submissions List -->
        <div class="space-y-4">
          <div
            v-for="submission in filteredSubmissions"
            :key="submission.id"
            class="glass-morphism p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition cursor-pointer"
            @click="selectSubmission(submission)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-xl font-bold text-white">{{ submission.projectName }}</h3>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusClass(submission.status)
                    ]"
                  >
                    {{ submission.status }}
                  </span>
                </div>
                <p class="text-white/60 mb-3">{{ submission.user.email }}</p>
                <div class="flex gap-4 text-sm text-white/50">
                  <span>🏢 {{ submission.industry }}</span>
                  <span>⚡ {{ submission.complexity }}</span>
                  <span>📅 {{ formatDate(submission.createdAt) }}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click.stop="openMessenger(submission)"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  title="Message Client"
                >
                  💬
                </button>
                <button
                  @click.stop="createInvoice(submission)"
                  :disabled="generatingInvoice"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                  title="Generate Invoice"
                >
                  {{ generatingInvoice && invoicePreselectedSubmission?.id === submission.id ? '⏳' : '🧾' }}
                </button>
                <button
                  @click.stop="manageTimeline(submission)"
                  class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                  title="Manage Timeline"
                >
                  📊
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Tab -->
      <div v-if="activeTab === 'messages'">
        <AdminMessagesPanel />
      </div>

      <!-- Invoices Tab -->
      <div v-if="activeTab === 'invoices'">
        <div class="glass-morphism p-6 rounded-xl border border-white/10">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white">Invoices</h3>
            <button
              @click="openCreateInvoice()"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2"
            >
              <span>🧾</span> + Create Invoice
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="!invoices.length" class="py-16 text-center">
            <div class="text-5xl mb-4">🧾</div>
            <p class="text-white/40 text-lg">No invoices yet</p>
            <p class="text-white/25 text-sm mt-1">Click "+ Create Invoice" to get started</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/5">
                <tr>
                  <th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider">Invoice #</th>
                  <th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider">Client</th>
                  <th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider">Due Date</th>
                  <th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="invoice in invoices"
                  :key="invoice.id"
                  class="border-t border-white/10 hover:bg-white/5 transition cursor-pointer"
                  @click="viewInvoice(invoice)"
                >
                  <td class="px-6 py-4 text-purple-300 font-mono text-sm font-medium">{{ invoice.invoiceNumber }}</td>
                  <td class="px-6 py-4">
                    <div class="text-white text-sm">{{ invoice.client?.fullName || invoice.client?.email || '—' }}</div>
                    <div class="text-white/40 text-xs">{{ invoice.client?.email }}</div>
                  </td>
                  <td class="px-6 py-4 text-white font-semibold tabular-nums">
                    {{ currencySymbol(invoice.currency) }}{{ Number(invoice.totalAmount).toFixed(2) }}
                    <span class="text-white/30 text-xs ml-1">{{ invoice.currency || 'USD' }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getInvoiceStatusClass(invoice.status)]">
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-white/60 text-sm">{{ invoice.dueDate ? formatDate(invoice.dueDate) : '—' }}</td>
                  <td class="px-6 py-4" @click.stop>
                    <div class="flex gap-2">
                      <button
                        @click="viewInvoice(invoice)"
                        class="px-3 py-1.5 text-xs rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition border border-purple-500/20"
                      >View</button>
                      <button
                        v-if="invoice.status === 'DRAFT'"
                        @click="quickSendInvoice(invoice)"
                        class="px-3 py-1.5 text-xs rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition border border-blue-500/20"
                      >Send</button>
                      <button
                        v-if="['SENT','OVERDUE'].includes(invoice.status)"
                        @click="quickMarkPaid(invoice)"
                        class="px-3 py-1.5 text-xs rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 transition border border-green-500/20"
                      >Paid</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Timelines Tab -->
      <div v-if="activeTab === 'timelines'">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <!-- Sidebar: list of timelines -->
          <div class="lg:col-span-1 space-y-2">
            <div class="glass-morphism rounded-xl border border-white/10 p-4">
              <h3 class="text-sm font-semibold text-white mb-3">Projects</h3>
              <div v-if="timelinesLoading" class="space-y-2">
                <div v-for="i in 3" :key="i" class="h-16 bg-white/5 rounded-lg animate-pulse" />
              </div>
              <div v-else-if="!timelines.length" class="text-white/30 text-xs text-center py-4">
                No timelines yet.<br />Create one from the Submissions tab.
              </div>
              <div v-else class="space-y-1.5">
                <button
                  v-for="t in timelines"
                  :key="t.id"
                  @click="selectedTimeline = t"
                  :class="['w-full text-left p-3 rounded-lg border transition-all',
                    selectedTimeline?.id === t.id
                      ? 'bg-purple-600/20 border-purple-500/40'
                      : 'bg-white/5 border-transparent hover:border-white/10']"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-semibold text-white truncate">{{ t.projectName }}</span>
                    <span v-if="t.githubRepo" class="flex-shrink-0 ml-1 text-xs text-purple-400" title="GitHub linked">🔗</span>
                  </div>
                  <div class="text-xs text-white/40 truncate">{{ t.clientName }}</div>
                  <div :class="['text-xs mt-1 font-semibold',
                    t.status === 'ACTIVE' ? 'text-green-400' :
                    t.status === 'COMPLETED' ? 'text-emerald-400' :
                    t.status === 'ON_HOLD' ? 'text-orange-400' : 'text-white/40']">
                    {{ t.status }}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Main panel -->
          <div class="lg:col-span-3">
            <div v-if="!selectedTimeline" class="glass-morphism rounded-xl border border-dashed border-white/20 p-16 text-center">
              <div class="text-4xl mb-3">📅</div>
              <div class="text-white/50">Select a project timeline from the list</div>
            </div>
            <div v-else>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-white">{{ selectedTimeline.projectName }}</h3>
                  <div class="text-sm text-white/50">{{ selectedTimeline.clientName }}</div>
                </div>
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold', getTimelineStatusClass(selectedTimeline.status)]">
                  {{ selectedTimeline.status }}
                </span>
              </div>
              <ProjectTimelinePanel
                :timeline="selectedTimeline"
                :admin-mode="true"
                @updated="onTimelineUpdated"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Linear Tab -->
      <div v-if="activeTab === 'linear'">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
            <div class="glass-morphism p-6 rounded-xl border border-white/10">
              <h3 class="text-lg font-semibold text-white mb-4">Select Submission</h3>
              <div v-if="!submissions.length" class="text-white/50 text-sm text-center py-4">
                No submissions available
              </div>
              <GlowingScrollbar v-else class="space-y-2 max-h-96">
                <button
                  v-for="sub in submissions"
                  :key="sub.id"
                  @click="selectedLinearSubmission = sub"
                  :class="[
                    'w-full text-left p-3 rounded-lg border transition-all',
                    selectedLinearSubmission?.id === sub.id
                      ? 'bg-purple-600/20 border-purple-500/40'
                      : 'bg-white/5 border-transparent hover:border-white/10'
                  ]"
                >
                  <div class="text-sm font-medium text-white truncate">{{ sub.projectName }}</div>
                  <div class="text-xs text-white/40 truncate">{{ sub.user?.email }}</div>
                </button>
              </GlowingScrollbar>
            </div>
          </div>
          <div class="lg:col-span-2">
            <div class="glass-morphism p-6 rounded-xl border border-white/10">
              <div v-if="!selectedLinearSubmission" class="text-center py-16">
                <div class="text-4xl mb-3">🔗</div>
                <div class="text-white/50">Select a submission to view Linear issues</div>
              </div>
              <LinearIssuesPanel
                v-else
                :key="selectedLinearSubmission.id"
                :submission-id="selectedLinearSubmission.id"
                @sync="syncToLinear"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <CreateInvoiceModal
    :show="showInvoiceModal"
    :submissions="submissions"
    :preselected-submission="invoicePreselectedSubmission"
    :pre-generated-items="invoicePreGeneratedItems"
    :pre-generated-tax-rate="invoicePreGeneratedTaxRate"
    :pre-generated-notes="invoicePreGeneratedNotes"
    @close="showInvoiceModal = false; invoicePreselectedSubmission = null; clearGeneratedInvoice()"
    @created="onInvoiceCreated"
  />

  <InvoicePreviewModal
    :show="showInvoicePreview"
    :invoice="selectedInvoice"
    @close="showInvoicePreview = false; selectedInvoice = null"
    @updated="onInvoiceUpdated"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'admin',
  layout: 'default'
})

const activeTab = ref('overview')
const search = ref('')
const filters = reactive({
  status: '',
  industry: ''
})

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'submissions', label: 'Submissions', icon: '📋' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'invoices', label: 'Invoices', icon: '🧾' },
  { id: 'timelines', label: 'Timelines', icon: '📅' },
  { id: 'linear', label: 'Linear', icon: '🔗' }
]

const stats = ref([
  { icon: '📋', value: '0', label: 'Total Submissions' },
  { icon: '⏳', value: '0', label: 'Pending' },
  { icon: '✅', value: '0', label: 'Completed' },
  { icon: '💰', value: '$0', label: 'Total Revenue' }
])

const submissions = ref([])
const users = ref<any[]>([])
const selectedUserDetail = ref<any>(null)
const verifyingEmail = ref(false)
const generatingLink = ref(false)
const deletingUser = ref(false)
const selectedSubmission = ref(null)
const selectedConversation = ref(null)
const conversations = ref([])
const messages = ref([])
const newMessage = ref('')
const invoices = ref<any[]>([])
const timelines = ref<any[]>([])
const selectedTimeline = ref<any>(null)
const timelinesLoading = ref(false)
const selectedLinearSubmission = ref<any>(null)
const showInvoiceModal = ref(false)
const showInvoicePreview = ref(false)
const selectedInvoice = ref<any>(null)
const invoicePreselectedSubmission = ref<any>(null)
const invoicePreGeneratedItems = ref<any[] | undefined>(undefined)
const invoicePreGeneratedTaxRate = ref<number | undefined>(undefined)
const invoicePreGeneratedNotes = ref<string | undefined>(undefined)
const generatingInvoice = ref(false)

const filteredSubmissions = computed(() => {
  let result = submissions.value

  if (search.value) {
    const query = search.value.toLowerCase()
    result = result.filter(s =>
      s.projectName.toLowerCase().includes(query) ||
      s.user.email.toLowerCase().includes(query)
    )
  }

  if (filters.status) {
    result = result.filter(s => s.status === filters.status)
  }

  if (filters.industry) {
    result = result.filter(s => s.industry === filters.industry)
  }

  return result
})

const fetchUsers = async () => {
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch('/api/admin/users', { headers }) as any
    if (data) {
      users.value = Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

const viewUser = async (user: any) => {
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch(`/api/admin/users?id=${user.id}`, { headers }) as any
    selectedUserDetail.value = data
  } catch (error) {
    console.error('Failed to fetch user details:', error)
  }
}

const verifyUserEmail = async (user: any) => {
  if (!user) return
  verifyingEmail.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/admin/users/${user.id}/verify-email`, {
      method: 'POST',
      headers,
    })
    selectedUserDetail.value = { ...user, emailVerified: true }
    await fetchUsers()
  } catch (error) {
    console.error('Failed to verify email:', error)
  } finally {
    verifyingEmail.value = false
  }
}

const generateAuthLink = async (user: any) => {
  if (!user) return
  generatingLink.value = true
  try {
    const headers = await getAuthHeaders()
    const result = await $fetch(`/api/admin/users/${user.id}/generate-auth-link`, {
      method: 'POST',
      headers,
    }) as any
    if (result?.properties?.confirmationUrl) {
      await navigator.clipboard.writeText(result.properties.confirmationUrl)
      alert('Auth link copied to clipboard!')
    }
  } catch (error) {
    console.error('Failed to generate auth link:', error)
    alert('Failed to generate auth link')
  } finally {
    generatingLink.value = false
  }
}

const deleteUser = async (user: any) => {
  if (!user) return
  if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
    return
  }
  deletingUser.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/admin/users/${user.id}/delete`, {
      method: 'POST',
      headers,
    })
    selectedUserDetail.value = null
    await fetchUsers()
  } catch (error) {
    console.error('Failed to delete user:', error)
  } finally {
    deletingUser.value = false
  }
}

const fetchSubmissions = async () => {
  try {
    const { data } = await useFetch('/api/admin/submissions')
    if (data.value) {
      submissions.value = data.value
      updateStats()
    }
  } catch (error) {
    console.error('Failed to fetch submissions:', error)
  }
}

const updateStats = () => {
  stats.value[0].value = submissions.value.length.toString()
  stats.value[1].value = submissions.value.filter(s => s.status === 'PENDING').length.toString()
  stats.value[2].value = submissions.value.filter(s => s.status === 'COMPLETED').length.toString()
}

const selectSubmission = (submission: any) => {
  selectedSubmission.value = submission
  // Navigate to detail view or open modal
}

const openMessenger = (submission: any) => {
  activeTab.value = 'messages'
  // Load conversation for this submission
}

const createInvoice = (submission: any) => {
  openCreateInvoice(submission)
}

const { getAccessToken } = useAuth()

const getAuthHeaders = async () => {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const clearGeneratedInvoice = () => {
  invoicePreGeneratedItems.value = undefined
  invoicePreGeneratedTaxRate.value = undefined
  invoicePreGeneratedNotes.value = undefined
}

const fetchInvoices = async () => {
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch('/api/admin/invoices', { headers }) as any
    if (data?.invoices) invoices.value = data.invoices
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
  }
}

const openCreateInvoice = async (submission?: any) => {
  invoicePreselectedSubmission.value = submission || null
  clearGeneratedInvoice()
  activeTab.value = 'invoices'
  showInvoiceModal.value = true

  // Auto-generate estimate when opening from a submission
  if (submission?.id) {
    generatingInvoice.value = true
    try {
      const headers = await getAuthHeaders()
      const result = await $fetch<{ success: boolean; pricing: any }>('/api/admin/invoices/generate', {
        method: 'POST',
        headers,
        body: { submissionId: submission.id, currency: 'USD' },
      }) as any
      if (result?.pricing?.items) {
        invoicePreGeneratedItems.value = result.pricing.items
        invoicePreGeneratedTaxRate.value = result.pricing.suggestedTaxRate
        invoicePreGeneratedNotes.value = result.pricing.notes
      }
    } catch (err) {
      console.error('Failed to auto-generate estimate:', err)
    } finally {
      generatingInvoice.value = false
    }
  }
}

const viewInvoice = (invoice: any) => {
  selectedInvoice.value = invoice
  showInvoicePreview.value = true
}

const quickSendInvoice = async (invoice: any) => {
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/admin/invoices/${invoice.id}`, {
      method: 'PATCH',
      headers,
      body: { status: 'SENT' }
    })
    await fetchInvoices()
  } catch (error) {
    console.error('Failed to send invoice:', error)
  }
}

const quickMarkPaid = async (invoice: any) => {
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/admin/invoices/${invoice.id}`, {
      method: 'PATCH',
      headers,
      body: { status: 'PAID' }
    })
    await fetchInvoices()
  } catch (error) {
    console.error('Failed to mark invoice paid:', error)
  }
}

const currencySymbol = (currency: string) =>
  ({ USD: '$', EUR: '€', GBP: '£', GHS: '₵', CAD: 'C$', AUD: 'A$' }[currency] ?? '$')

const onInvoiceCreated = async () => {
  showInvoiceModal.value = false
  invoicePreselectedSubmission.value = null
  clearGeneratedInvoice()
  await fetchInvoices()
}

const onInvoiceUpdated = async (updated: any) => {
  if (updated) {
    const idx = invoices.value.findIndex(i => i.id === updated.id)
    if (idx !== -1) invoices.value[idx] = { ...invoices.value[idx], ...updated }
  } else {
    await fetchInvoices()
  }
  showInvoicePreview.value = false
  selectedInvoice.value = null
}

const manageTimeline = (submission: any) => {
  activeTab.value = 'timelines'
  // Load timeline for this submission
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  try {
    await $fetch('/api/admin/messages', {
      method: 'POST',
      body: {
        receiverId: selectedConversation.value.clientId,
        content: newMessage.value
      }
    })

    messages.value.push({
      id: Date.now(),
      sender: 'admin',
      content: newMessage.value,
      time: new Date().toLocaleTimeString()
    })

    newMessage.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const exportData = () => {
  const csv = convertToCSV(filteredSubmissions.value)
  downloadCSV(csv, 'submissions-export.csv')
}

const convertToCSV = (data: any[]) => {
  const headers = ['Project Name', 'Client Email', 'Industry', 'Status', 'Created At']
  const rows = data.map(s => [
    s.projectName,
    s.user.email,
    s.industry,
    s.status,
    new Date(s.createdAt).toLocaleDateString()
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusClass = (status: string) => {
  const classes = {
    PENDING: 'bg-yellow-500/20 text-yellow-300',
    REVIEWING: 'bg-blue-500/20 text-blue-300',
    QUOTED: 'bg-purple-500/20 text-purple-300',
    ACCEPTED: 'bg-green-500/20 text-green-300',
    IN_PROGRESS: 'bg-cyan-500/20 text-cyan-300',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300',
    REJECTED: 'bg-red-500/20 text-red-300'
  }
  return classes[status] || 'bg-gray-500/20 text-gray-300'
}

const getInvoiceStatusClass = (status: string) => {
  const classes = {
    DRAFT: 'bg-gray-500/20 text-gray-300',
    SENT: 'bg-blue-500/20 text-blue-300',
    PAID: 'bg-green-500/20 text-green-300',
    OVERDUE: 'bg-red-500/20 text-red-300',
    CANCELLED: 'bg-gray-500/20 text-gray-300'
  }
  return classes[status] || 'bg-gray-500/20 text-gray-300'
}

const getTimelineStatusClass = (status: string) => {
  const classes = {
    PLANNING: 'bg-yellow-500/20 text-yellow-300',
    ACTIVE: 'bg-green-500/20 text-green-300',
    ON_HOLD: 'bg-orange-500/20 text-orange-300',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300',
    CANCELLED: 'bg-red-500/20 text-red-300'
  }
  return classes[status] || 'bg-gray-500/20 text-gray-300'
}

onMounted(() => {
  fetchUsers()
  fetchSubmissions()
  fetchInvoices()
  fetchTimelines()
})

async function fetchTimelines() {
  timelinesLoading.value = true
  try {
    const token = await getAccessToken()
    timelines.value = await $fetch('/api/admin/timelines', {
      headers: { Authorization: `Bearer ${token}` },
    }) as any[]
    if (timelines.value.length && !selectedTimeline.value) {
      selectedTimeline.value = timelines.value[0]
    }
  } catch (e) {
    console.error('fetchTimelines error', e)
  } finally {
    timelinesLoading.value = false
  }
}

function onTimelineUpdated(updatedTimeline: any) {
  const idx = timelines.value.findIndex(t => t.id === updatedTimeline.id)
  if (idx >= 0) timelines.value[idx] = { ...timelines.value[idx], ...updatedTimeline }
  if (selectedTimeline.value?.id === updatedTimeline.id) {
    selectedTimeline.value = { ...selectedTimeline.value, ...updatedTimeline }
  }
}

const syncToLinear = async () => {
  if (!selectedLinearSubmission.value) return
  
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/linear/sync', {
      method: 'POST',
      headers,
      body: { submissionId: selectedLinearSubmission.value.id }
    })
  } catch (error) {
    console.error('Failed to sync to Linear:', error)
  }
}
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
