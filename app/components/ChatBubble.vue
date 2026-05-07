<script setup lang="ts">
import GlowingScrollbar from '@/components/ui/GlowingScrollbar.vue'

const { user, getAccessToken } = useAuth()
const { subscribe, broadcast, broadcastTyping, startPolling, stopPolling, unsubscribe } = useRealtimeMessages()

const open = ref(false)
const messages = ref<any[]>([])
const newMessage = ref('')
const loading = ref(false)
const sending = ref(false)
const unreadCount = ref(0)
const isAiHandled = ref(true)
const adminName = ref('CharaTech Support')
const aiTyping = ref(false)
const otherTyping = ref(false)
const messagesEnd = ref<HTMLElement | null>(null)
const lastMessageId = ref<string | null>(null)
const editingMessage = ref<any>(null)
const editText = ref('')
const attachingFile = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
let typingTimeout: ReturnType<typeof setTimeout> | null = null

const toggleOpen = () => {
  open.value = !open.value
  if (open.value) {
    unreadCount.value = 0
    markRead()
    nextTick(scrollToBottom)
  }
}

const scrollToBottom = () => {
  messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const canEdit = (msg: any) => {
  if (!user.value || msg.senderId !== user.value.id) return false
  if (msg.isBot || msg.deleted) return false
  const diff = Date.now() - new Date(msg.createdAt).getTime()
  return diff < 15 * 60 * 1000
}

const startEdit = (msg: any) => {
  editingMessage.value = msg
  editText.value = msg.content
}

const cancelEdit = () => {
  editingMessage.value = null
  editText.value = ''
}

const saveEdit = async () => {
  if (!editingMessage.value || !editText.value.trim()) return
  const content = editText.value.trim()
  try {
    const token = await getAccessToken()
    await $fetch(`/api/messages/${editingMessage.value.id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { content },
    })
    const msg = messages.value.find(m => m.id === editingMessage.value.id)
    if (msg) { msg.content = content; msg.editedAt = new Date().toISOString() }
    cancelEdit()
  } catch { /* silent */ }
}

const deleteMessage = async (msg: any) => {
  try {
    const token = await getAccessToken()
    await $fetch(`/api/messages/${msg.id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const idx = messages.value.findIndex(m => m.id === msg.id)
    if (idx >= 0) { messages.value[idx].deleted = true; messages.value[idx].content = '[Message deleted]' }
  } catch { /* silent */ }
}

const handleFileSelect = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  attachingFile.value = true
  try {
    const token = await getAccessToken()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'chat-attachments')

    const result = await $fetch<{ url: string; fileName: string }>('/api/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    newMessage.value = result.fileName
    ;(newMessage as any)._fileUrl = result.url
    ;(newMessage as any)._fileName = result.fileName
  } catch {
    toast.error('Failed to upload file')
  } finally {
    attachingFile.value = false
    if (input) input.value = ''
  }
}

// ─── Data ──────────────────────────────────────────────────────────────────

const fetchMessages = async () => {
  if (!user.value) return
  try {
    const token = await getAccessToken()
    const data = await $fetch<any>('/api/messages', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const newMessages = data.messages || []
    if (newMessages.length > messages.value.length) {
      messages.value = newMessages
      lastMessageId.value = newMessages[newMessages.length - 1]?.id || null
      nextTick(scrollToBottom)
    } else if (messages.value.length === 0) {
      messages.value = newMessages
      lastMessageId.value = newMessages[newMessages.length - 1]?.id || null
    }
    isAiHandled.value = data.isAiHandled ?? true
    adminName.value = data.adminName || 'CharaTech Support'
  } catch {
    // Silent fail
  } finally {
    loading.value = false
  }
}

const markRead = async () => {
  if (!user.value) return
  try {
    const token = await getAccessToken()
    await $fetch('/api/messages/read', { method: 'PATCH', headers: token ? { Authorization: `Bearer ${token}` } : {} })
  } catch { /* silent */ }
}

const sendMessage = async () => {
  const fileUrl = (newMessage as any)._fileUrl
  const fileName = (newMessage as any)._fileName
  const content = newMessage.value.trim()
  if ((!content && !fileUrl) || sending.value) return

  newMessage.value = ''
  delete (newMessage as any)._fileUrl
  delete (newMessage as any)._fileName
  sending.value = true

  // Optimistic UI
  const tempId = `temp-${Date.now()}`
  messages.value.push({
    id: tempId,
    senderId: user.value?.id,
    receiverId: '__admin__',
    content: content || `📎 ${fileName}`,
    fileUrl,
    fileName,
    isBot: false,
    createdAt: new Date().toISOString(),
  })
  nextTick(scrollToBottom)

  // Show AI typing indicator if in AI mode
  if (isAiHandled.value) {
    setTimeout(() => { aiTyping.value = true; nextTick(scrollToBottom) }, 300)
  }

  try {
    const token = await getAccessToken()
    const data = await $fetch<any>('/api/messages', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: { content, fileUrl, fileName },
    })

    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx >= 0 && data.message) messages.value[idx] = data.message

    aiTyping.value = false
    if (data.botReply) {
      setTimeout(() => {
        messages.value.push(data.botReply)
        nextTick(scrollToBottom)
      }, 400)
    }

    if (data.message) {
      await broadcast({ ...data.message, createdAt: data.message.createdAt })
    }
  } catch {
    aiTyping.value = false
    newMessage.value = content
    messages.value = messages.value.filter(m => m.id !== tempId)
  } finally {
    sending.value = false
    nextTick(scrollToBottom)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
}

const handleTyping = () => {
  if (!user.value) return
  broadcastTyping({ senderId: user.value.id, receiverId: '__admin__' })
  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    otherTyping.value = false
  }, 3000)
}

// ─── Realtime ──────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!user.value) return
  loading.value = true
  await fetchMessages()

  subscribe(
    user.value.id,
    (msg) => {
      messages.value.push(msg)
      if (!open.value) unreadCount.value++
      else { markRead(); nextTick(scrollToBottom) }
    },
    () => {
      otherTyping.value = true
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => { otherTyping.value = false }, 3000)
    }
  )

  // Poll for offline messages every 30s when chat is open
  watch(open, (isOpen) => {
    if (isOpen) startPolling(fetchMessages, 30000)
    else stopPolling()
  })
  if (open.value) startPolling(fetchMessages, 30000)
})

onUnmounted(() => {
  stopPolling()
  unsubscribe()
})
</script>

<template>
  <div v-if="user" class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

    <!-- Unread badge + bubble button -->
    <Transition name="slide-up">
      <div v-if="open"
        class="w-[360px] sm:w-[400px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style="max-height: 560px; background: rgba(15,10,30,0.92); backdrop-filter: blur(20px);">

        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-700 via-violet-700 to-pink-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="relative">
              <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white shadow-inner">
                {{ isAiHandled ? '🤖' : '👨‍💻' }}
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-purple-800 animate-pulse" />
            </div>
            <div>
              <div class="text-white font-semibold text-sm leading-tight">{{ adminName }}</div>
              <div class="text-white/60 text-xs">
                {{ isAiHandled ? '🤖 AI Assistant' : '👤 Human support' }}
                <span v-if="otherTyping" class="text-indigo-300 ml-1">is typing…</span>
              </div>
            </div>
          </div>
          <button @click="open = false"
            class="text-white/60 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10">
            ✕
          </button>
        </div>

        <!-- Messages area -->
        <GlowingScrollbar class="flex-1 px-3 py-3 space-y-2"
          style="min-height: 0; background: rgba(10,5,20,0.6);">
          <div v-if="loading" class="flex items-center justify-center h-24">
            <div class="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>

          <div v-else-if="!messages.length" class="text-center py-8">
            <div class="text-3xl mb-2">💬</div>
            <div class="text-white/40 text-sm">Send a message to get started</div>
            <div class="text-white/25 text-xs mt-1">We typically reply within minutes</div>
          </div>

          <template v-else>
            <div v-for="msg in messages" :key="msg.id"
              :class="['flex', msg.senderId === user?.id ? 'justify-end' : 'justify-start']">
              <div :class="[
                'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed relative group',
                msg.deleted
                  ? 'bg-white/5 text-white/30 rounded-br-sm italic'
                  : msg.senderId === user?.id
                    ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-br-sm shadow-lg shadow-purple-900/40'
                    : msg.isBot
                      ? 'bg-indigo-900/60 border border-indigo-500/30 text-indigo-100 rounded-bl-sm italic'
                      : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
              ]">
                <!-- Bot label -->
                <div v-if="msg.isBot" class="text-xs text-indigo-300/70 mb-0.5 not-italic font-medium">🤖 AI Assistant</div>

                <!-- Edit mode -->
                <div v-if="editingMessage?.id === msg.id" class="space-y-1">
                  <textarea v-model="editText" rows="2"
                    class="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white resize-none focus:outline-none focus:border-purple-500"
                    @keydown.enter.exact.prevent="saveEdit"
                    @keydown.escape="cancelEdit" />
                  <div class="flex gap-1">
                    <button @click="saveEdit" class="text-xs text-purple-300 hover:text-purple-200">Save</button>
                    <button @click="cancelEdit" class="text-xs text-white/40 hover:text-white/60">Cancel</button>
                  </div>
                </div>

                <!-- Normal message -->
                <template v-else>
                  <div v-if="msg.fileUrl" class="mb-1">
                    <a :href="msg.fileUrl" target="_blank"
                      class="text-xs text-purple-300 hover:text-purple-200 underline flex items-center gap-1">
                      📎 {{ msg.fileName || 'Attachment' }}
                    </a>
                  </div>
                  <div class="break-words">{{ msg.content }}</div>
                  <div :class="[
                    'text-xs mt-1 flex items-center gap-1',
                    msg.senderId === user?.id ? 'text-right justify-end' : 'opacity-50'
                  ]">
                    {{ formatTime(msg.createdAt) }}
                    <span v-if="msg.editedAt" class="text-white/30 italic">(edited)</span>
                    <!-- Read receipt for own messages -->
                    <span v-if="msg.senderId === user?.id && !msg.isBot && !msg.deleted" class="text-white/40" :title="msg.read ? 'Read' : 'Sent'">
                      {{ msg.read ? '✓✓' : '✓' }}
                    </span>
                  </div>

                  <!-- Action buttons on hover -->
                  <div v-if="!msg.deleted && !msg.isBot"
                    class="absolute top-0 right-0 -mt-8 hidden group-hover:flex items-center gap-1 bg-gray-900/80 rounded-lg px-1 py-0.5 shadow-lg">
                    <button v-if="canEdit(msg)" @click="startEdit(msg)"
                      class="text-xs text-white/50 hover:text-white/80 p-0.5" title="Edit">✎</button>
                    <button @click="deleteMessage(msg)"
                      class="text-xs text-white/50 hover:text-red-400 p-0.5" title="Delete">🗑</button>
                  </div>
                </template>
              </div>
            </div>
          </template>

          <!-- AI typing indicator -->
          <div v-if="aiTyping" class="flex justify-start">
            <div class="bg-indigo-900/60 border border-indigo-500/30 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <div v-for="i in 3" :key="i"
                class="w-2 h-2 rounded-full bg-indigo-400"
                :style="`animation: bounce 1.2s ease-in-out ${(i-1)*0.2}s infinite`" />
            </div>
          </div>

          <!-- Human typing indicator -->
          <div v-if="otherTyping && !isAiHandled" class="flex justify-start">
            <div class="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <div v-for="i in 3" :key="i"
                class="w-2 h-2 rounded-full bg-white/50"
                :style="`animation: bounce 1.2s ease-in-out ${(i-1)*0.2}s infinite`" />
            </div>
          </div>

          <div ref="messagesEnd" />
        </GlowingScrollbar>

        <!-- Handoff notice -->
        <div v-if="!isAiHandled"
          class="px-4 py-2 bg-green-900/30 border-t border-green-500/20 text-green-300 text-xs text-center flex-shrink-0">
          ✅ You're now chatting with a specialist
        </div>

        <!-- Input -->
        <div class="px-3 py-3 border-t border-white/10 flex gap-2 flex-shrink-0"
          style="background: rgba(15,10,30,0.95)">
          <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" accept="image/*,video/*,.pdf,.doc,.docx" />
          <button @click="fileInput?.click()" :disabled="attachingFile"
            class="flex-shrink-0 w-10 h-10 rounded-xl text-white/40 hover:text-white/70 flex items-center justify-center disabled:opacity-40 transition-all">
            <div v-if="attachingFile" class="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <textarea
            v-model="newMessage"
            @keydown="handleKeydown"
            @input="handleTyping"
            placeholder="Type a message… (Enter to send)"
            rows="1"
            class="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
            style="max-height: 80px; overflow-y: auto"
          />
          <button
            @click="sendMessage"
            :disabled="(!newMessage.trim() && !(newMessage as any)._fileUrl) || sending"
            class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white flex items-center justify-center disabled:opacity-40 hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-900/40 active:scale-95"
          >
            <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <div v-else class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Floating bubble button -->
    <button
      @click="toggleOpen"
      class="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600 shadow-2xl shadow-purple-900/60 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      style="box-shadow: 0 0 24px rgba(139,92,246,0.5), 0 8px 32px rgba(0,0,0,0.4);"
    >
      <div class="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-sm -z-10 scale-110" />

      <Transition name="fade" mode="out-in">
        <svg v-if="!open" key="chat" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <svg v-else key="close" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </Transition>

      <Transition name="pop">
        <div v-if="unreadCount > 0 && !open"
          class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </div>
      </Transition>
    </button>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.pop-enter-active { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: pop 0.2s ease-in reverse; }
@keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
