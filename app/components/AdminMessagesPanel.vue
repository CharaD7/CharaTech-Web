<script setup lang="ts">
import GlowingScrollbar from '@/components/ui/GlowingScrollbar.vue'

const toast = useAppToast()
const { user, getAccessToken } = useAuth()
const { subscribe, broadcast, unsubscribe } = useRealtimeMessages()

const conversations = ref<any[]>([])
const selectedClientId = ref<string | null>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const loadingConvs = ref(false)
const loadingThread = ref(false)
const sending = ref(false)
const isAiHandled = ref(true)
const selectedClient = ref<any>(null)
const adminId = ref<string | null>(null)

const messagesEnd = ref<HTMLElement | null>(null)

const QUICK_REPLIES = [
  '✅ Thanks for reaching out! I\'ll review your request and get back to you shortly.',
  '📋 I\'ve reviewed your submission. Could you provide more details about your requirements?',
  '💰 I\'ve sent your invoice. Please review it and let me know if you have any questions.',
  '🚀 Great news! Your project is now in progress. Check the Timeline tab for updates.',
  '📅 I\'ll need a few more days to complete this milestone. Thank you for your patience.',
]

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const formatDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return formatTime(date)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const scrollToBottom = () => {
  nextTick(() => messagesEnd.value?.scrollIntoView({ behavior: 'smooth' }))
}

// ─── Auth headers ───────────────────────────────────────────────────────────
async function authHeaders() {
  const token = await getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Conversations list ─────────────────────────────────────────────────────
async function fetchConversations() {
  loadingConvs.value = true
  try {
    const headers = await authHeaders()
    conversations.value = await $fetch<any[]>('/api/admin/messages', { headers }) as any[]
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to fetch conversations')
  } finally {
    loadingConvs.value = false
  }
}

async function selectConversation(clientId: string) {
  selectedClientId.value = clientId
  loadingThread.value = true
  messages.value = []

  const conv = conversations.value.find(c => c.clientId === clientId)
  if (conv) conv.unreadCount = 0

  try {
    const headers = await authHeaders()
    const data = await $fetch<any>(`/api/admin/messages/${clientId}`, { headers })
    messages.value = data.messages || []
    isAiHandled.value = data.isAiHandled ?? true
    selectedClient.value = data.client
    adminId.value = data.adminId
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to load conversation')
  } finally {
    loadingThread.value = false
    scrollToBottom()
  }
}

// ─── Send message ───────────────────────────────────────────────────────────
async function sendMessage() {
  if (!newMessage.value.trim() || sending.value || !selectedClientId.value) return

  const content = newMessage.value.trim()
  newMessage.value = ''
  sending.value = true

  // Optimistic
  const tempId = `temp-${Date.now()}`
  messages.value.push({
    id: tempId,
    senderId: user.value?.id,
    receiverId: selectedClientId.value,
    content,
    isBot: false,
    createdAt: new Date().toISOString(),
  })
  scrollToBottom()

  try {
    const headers = await authHeaders()
    const data = await $fetch<any>('/api/admin/messages', {
      method: 'POST',
      headers,
      body: { receiverId: selectedClientId.value, content },
    })

    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx >= 0 && data.message) messages.value[idx] = data.message

    isAiHandled.value = false

    const conv = conversations.value.find(c => c.clientId === selectedClientId.value)
    if (conv) { conv.lastMessage = content; conv.lastMessageAt = new Date().toISOString() }

    if (data.message) await broadcast(data.message)
  } catch (e: any) {
    toast.error(e.data?.message || 'Failed to send message')
    messages.value = messages.value.filter(m => m.id !== tempId)
    newMessage.value = content
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

function useQuickReply(text: string) {
  newMessage.value = text
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
}

// ─── Realtime ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchConversations()
  if (!user.value) return

  // Admin subscribes to their own channel to receive client broadcasts
  subscribe(user.value.id, (msg) => {
    // If this message is in the currently open thread, append it
    if (msg.senderId === selectedClientId.value) {
      messages.value.push(msg)
      scrollToBottom()
    }
    // Update or insert conversation
    const conv = conversations.value.find(c => c.clientId === msg.senderId)
    if (conv) {
      conv.lastMessage = msg.content
      conv.lastMessageAt = msg.createdAt
      if (msg.senderId !== selectedClientId.value) conv.unreadCount = (conv.unreadCount || 0) + 1
    } else {
      fetchConversations() // New conversation — refresh list
    }
  })
})

onUnmounted(() => unsubscribe())
</script>

<template>
  <div class="grid md:grid-cols-3 gap-4 h-[680px]">

    <!-- ─── Conversation List ───────────────────────────────────────────── -->
    <div class="glass-morphism rounded-xl border border-white/10 flex flex-col overflow-hidden">
      <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <h3 class="text-base font-bold text-white">Messages</h3>
        <button @click="fetchConversations"
          class="text-white/40 hover:text-white transition-colors text-sm p-1 rounded-lg hover:bg-white/10">
          🔄
        </button>
      </div>

      <GlowingScrollbar class="flex-1 divide-y divide-white/5">
        <div v-if="loadingConvs" class="p-4 space-y-3">
          <div v-for="i in 4" :key="i" class="h-14 bg-white/5 rounded-lg animate-pulse" />
        </div>

        <div v-else-if="!conversations.length" class="flex flex-col items-center justify-center h-full text-white/30 gap-2 p-6">
          <div class="text-3xl">💬</div>
          <div class="text-sm text-center">No conversations yet</div>
        </div>

        <button
          v-for="conv in conversations"
          :key="conv.clientId"
          @click="selectConversation(conv.clientId)"
          :class="[
            'w-full text-left px-4 py-3 transition-all hover:bg-white/5',
            selectedClientId === conv.clientId ? 'bg-purple-600/15 border-l-2 border-purple-500' : 'border-l-2 border-transparent'
          ]"
        >
          <div class="flex items-start gap-3">
            <!-- Avatar -->
            <div class="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {{ conv.clientName.charAt(0).toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-0.5">
                <span class="text-sm font-semibold text-white truncate">{{ conv.clientName }}</span>
                <span class="text-xs text-white/30 flex-shrink-0 ml-1">{{ formatDate(conv.lastMessageAt) }}</span>
              </div>
              <div class="flex items-center justify-between gap-1">
                <div class="text-xs text-white/40 truncate">{{ conv.lastMessage }}</div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <span v-if="conv.isAiHandled" class="text-xs text-indigo-400" title="AI handling">🤖</span>
                  <span v-if="conv.unreadCount > 0"
                    class="min-w-5 h-5 px-1 rounded-full bg-purple-500 text-xs font-bold text-white flex items-center justify-center">
                    {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </GlowingScrollbar>
    </div>

    <!-- ─── Message Thread ──────────────────────────────────────────────── -->
    <div class="md:col-span-2 glass-morphism rounded-xl border border-white/10 flex flex-col overflow-hidden">

      <!-- No conversation selected -->
      <div v-if="!selectedClientId" class="flex-1 flex flex-col items-center justify-center text-white/30 gap-3">
        <div class="text-5xl opacity-40">💬</div>
        <div class="text-base">Select a conversation</div>
        <div class="text-xs">Choose a client from the list to view messages</div>
      </div>

      <template v-else>
        <!-- Thread header -->
        <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {{ selectedClient?.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div>
              <div class="text-sm font-bold text-white">{{ selectedClient?.name || 'Client' }}</div>
              <div class="text-xs text-white/40">{{ selectedClient?.email }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- AI / Human badge -->
            <div :class="[
              'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
              isAiHandled ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'
            ]">
              {{ isAiHandled ? '🤖 AI mode' : '👤 Human mode' }}
            </div>
          </div>
        </div>

        <!-- Messages -->
        <GlowingScrollbar class="flex-1 px-4 py-3 space-y-2 min-h-0"
          style="background: rgba(10,5,20,0.4);">
          <div v-if="loadingThread" class="flex items-center justify-center h-24">
            <div class="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>

          <template v-else>
            <div v-for="msg in messages" :key="msg.id"
              :class="['flex gap-2', msg.senderId === adminId ? 'justify-end' : 'justify-start']">

              <!-- Client avatar (left messages) -->
              <div v-if="msg.senderId !== adminId"
                class="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white self-end">
                {{ selectedClient?.name?.charAt(0)?.toUpperCase() || 'C' }}
              </div>

              <div :class="[
                'max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                msg.senderId === adminId
                  ? msg.isBot
                    ? 'bg-indigo-900/60 border border-indigo-500/30 text-indigo-100 rounded-br-sm italic'
                    : 'bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-br-sm shadow-md shadow-purple-900/40'
                  : 'bg-white/8 text-white rounded-bl-sm border border-white/8'
              ]">
                <div v-if="msg.isBot" class="text-xs text-indigo-300/70 mb-0.5 not-italic font-medium">🤖 Auto-reply</div>
                <div class="break-words">{{ msg.content }}</div>
                <div :class="['text-xs mt-1 opacity-50', msg.senderId === adminId ? 'text-right' : '']">
                  {{ formatTime(msg.createdAt) }}
                </div>
              </div>
            </div>
          </template>

          <div ref="messagesEnd" />
        </GlowingScrollbar>

        <!-- Quick replies -->
        <div class="px-4 py-2 border-t border-white/5 overflow-x-auto flex-shrink-0">
          <div class="flex gap-2 pb-1" style="min-width: max-content">
            <button
              v-for="reply in QUICK_REPLIES"
              :key="reply"
              @click="useQuickReply(reply)"
              class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-white/60 hover:text-white transition-all truncate max-w-[200px]"
              :title="reply"
            >
              {{ reply.slice(0, 30) }}…
            </button>
          </div>
        </div>

        <!-- Input -->
        <div class="px-4 py-3 border-t border-white/10 flex gap-2 items-end flex-shrink-0"
          style="background: rgba(15,10,30,0.6)">
          <textarea
            v-model="newMessage"
            @keydown="handleKeydown"
            placeholder="Reply to client… (Enter to send, Shift+Enter for newline)"
            rows="2"
            class="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-all"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || sending"
            class="flex-shrink-0 h-10 px-4 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-900/30"
          >
            <span v-if="!sending">Send</span>
            <div v-else class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>
