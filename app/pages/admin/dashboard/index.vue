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
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  title="Create Invoice"
                >
                  🧾
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
      <div v-if="activeTab === 'messages'" class="grid md:grid-cols-3 gap-6">
        <!-- Conversations List -->
        <div class="glass-morphism p-6 rounded-xl border border-white/10">
          <h3 class="text-xl font-bold mb-4 text-white">Conversations</h3>
          <div class="space-y-2">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              @click="selectedConversation = conv"
              :class="[
                'p-4 rounded-lg cursor-pointer transition',
                selectedConversation?.id === conv.id
                  ? 'bg-purple-600/30 border border-purple-500'
                  : 'bg-white/5 hover:bg-white/10'
              ]"
            >
              <div class="font-semibold text-white">{{ conv.clientName }}</div>
              <div class="text-sm text-white/60 truncate">{{ conv.lastMessage }}</div>
              <div class="text-xs text-white/40 mt-1">{{ conv.time }}</div>
            </div>
          </div>
        </div>

        <!-- Message Thread -->
        <div class="md:col-span-2 glass-morphism p-6 rounded-xl border border-white/10">
          <div v-if="selectedConversation">
            <h3 class="text-xl font-bold mb-4 text-white">{{ selectedConversation.clientName }}</h3>
            
            <div class="h-96 overflow-y-auto mb-4 space-y-3 p-4 bg-black/20 rounded-lg">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="[
                  'p-3 rounded-lg max-w-md',
                  msg.sender === 'admin'
                    ? 'ml-auto bg-purple-600 text-white'
                    : 'bg-white/10 text-white'
                ]"
              >
                <div class="text-sm">{{ msg.content }}</div>
                <div class="text-xs opacity-60 mt-1">{{ msg.time }}</div>
              </div>
            </div>

            <div class="flex gap-2">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type a message..."
                class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 outline-none transition"
                @keyup.enter="sendMessage"
              />
              <button
                @click="sendMessage"
                class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
              >
                Send
              </button>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full text-white/40">
            Select a conversation to start messaging
          </div>
        </div>
      </div>

      <!-- Invoices Tab -->
      <div v-if="activeTab === 'invoices'">
        <div class="glass-morphism p-6 rounded-xl border border-white/10">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white">Invoices</h3>
            <button
              @click="showInvoiceModal = true"
              class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition"
            >
              + Create Invoice
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/5">
                <tr>
                  <th class="px-6 py-3 text-left text-white">Invoice #</th>
                  <th class="px-6 py-3 text-left text-white">Client</th>
                  <th class="px-6 py-3 text-left text-white">Amount</th>
                  <th class="px-6 py-3 text-left text-white">Status</th>
                  <th class="px-6 py-3 text-left text-white">Due Date</th>
                  <th class="px-6 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="invoice in invoices"
                  :key="invoice.id"
                  class="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td class="px-6 py-4 text-white">{{ invoice.invoiceNumber }}</td>
                  <td class="px-6 py-4 text-white">{{ invoice.clientName }}</td>
                  <td class="px-6 py-4 text-white font-semibold">${{ invoice.totalAmount }}</td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        getInvoiceStatusClass(invoice.status)
                      ]"
                    >
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-white">{{ formatDate(invoice.dueDate) }}</td>
                  <td class="px-6 py-4">
                    <button class="text-blue-400 hover:text-blue-300 mr-3">View</button>
                    <button class="text-green-400 hover:text-green-300">Send</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Timelines Tab -->
      <div v-if="activeTab === 'timelines'">
        <div class="glass-morphism p-6 rounded-xl border border-white/10">
          <h3 class="text-2xl font-bold mb-6 text-white">Project Timelines</h3>
          
          <div class="space-y-6">
            <div
              v-for="timeline in timelines"
              :key="timeline.id"
              class="bg-white/5 p-6 rounded-lg"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h4 class="text-xl font-bold text-white">{{ timeline.projectName }}</h4>
                  <p class="text-white/60">{{ timeline.clientName }}</p>
                </div>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    getTimelineStatusClass(timeline.status)
                  ]"
                >
                  {{ timeline.status }}
                </span>
              </div>

              <div class="space-y-3">
                <div
                  v-for="milestone in timeline.milestones"
                  :key="milestone.id"
                  class="flex items-center gap-4 p-4 bg-black/20 rounded-lg"
                >
                  <div
                    :class="[
                      'w-4 h-4 rounded-full',
                      milestone.status === 'COMPLETED' ? 'bg-green-500' :
                      milestone.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      'bg-gray-500'
                    ]"
                  ></div>
                  <div class="flex-1">
                    <div class="font-semibold text-white">{{ milestone.title }}</div>
                    <div class="text-sm text-white/60">
                      {{ formatDate(milestone.startDate) }} - {{ formatDate(milestone.endDate) }}
                    </div>
                  </div>
                  <span class="text-sm text-white/70">{{ milestone.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
  { id: 'submissions', label: 'Submissions', icon: '📋' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'invoices', label: 'Invoices', icon: '🧾' },
  { id: 'timelines', label: 'Timelines', icon: '📅' }
]

const stats = ref([
  { icon: '📋', value: '0', label: 'Total Submissions' },
  { icon: '⏳', value: '0', label: 'Pending' },
  { icon: '✅', value: '0', label: 'Completed' },
  { icon: '💰', value: '$0', label: 'Total Revenue' }
])

const submissions = ref([])
const selectedSubmission = ref(null)
const selectedConversation = ref(null)
const conversations = ref([])
const messages = ref([])
const newMessage = ref('')
const invoices = ref([])
const timelines = ref([])
const showInvoiceModal = ref(false)

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
  activeTab.value = 'invoices'
  showInvoiceModal.value = true
  // Pre-fill invoice with submission data
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
  fetchSubmissions()
})
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
