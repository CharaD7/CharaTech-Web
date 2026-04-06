<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show && invoice"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="$emit('close')" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden border border-purple-500/20"
          style="background: linear-gradient(135deg, rgba(12,8,32,0.98) 0%, rgba(22,8,48,0.98) 100%); box-shadow: 0 0 100px rgba(168,85,247,0.12), 0 0 40px rgba(0,0,0,0.8);"
        >
          <!-- Header -->
          <div
            class="flex-shrink-0 flex items-center justify-between px-7 py-4 border-b border-purple-500/20"
            style="background: linear-gradient(90deg, rgba(88,28,135,0.6) 0%, rgba(190,24,93,0.3) 100%);"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style="background: linear-gradient(135deg, #7c3aed, #db2777); box-shadow: 0 0 16px rgba(168,85,247,0.4);"
              >
                🧾
              </div>
              <div>
                <h2 class="text-base font-bold text-white">{{ invoice.invoiceNumber }}</h2>
                <div class="flex items-center gap-2 mt-0.5">
                  <span
                    :class="['px-2 py-0.5 rounded-md text-xs font-semibold', statusClass]"
                  >{{ invoice.status }}</span>
                  <span class="text-white/30 text-xs">Issued {{ issuedDisplay }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <!-- Print -->
              <button
                @click="printInvoice"
                class="px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white transition border border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center gap-1.5"
              >
                🖨️ Print
              </button>
              <button
                @click="$emit('close')"
                class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition border border-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Invoice document (scrollable) -->
          <GlowingScrollbar class="flex-1 p-6">
            <div
              id="invoice-print-area"
              class="rounded-2xl overflow-hidden border border-white/8"
              style="background: rgba(20,12,45,0.8);"
            >
              <!-- Header band -->
              <div
                class="px-8 py-7"
                style="background: linear-gradient(135deg, rgba(88,28,135,0.9) 0%, rgba(126,34,206,0.7) 50%, rgba(190,24,93,0.5) 100%);"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <div class="text-3xl font-black tracking-tighter text-white mb-1">CHARATECH</div>
                    <div class="text-purple-300/60 text-xs tracking-widest uppercase">Software Requirements Platform</div>
                  </div>
                  <div class="text-right">
                    <div class="text-white/40 text-[10px] uppercase tracking-widest mb-1">Invoice</div>
                    <div class="text-white font-bold text-2xl">{{ invoice.invoiceNumber }}</div>
                    <div
                      :class="['mt-2 px-3 py-1 rounded-full text-xs font-bold inline-block', statusClass]"
                    >{{ invoice.status }}</div>
                  </div>
                </div>
              </div>

              <!-- Meta strip -->
              <div class="grid grid-cols-3 border-b border-white/5 bg-purple-900/10">
                <div class="px-6 py-3 border-r border-white/5">
                  <p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Issue Date</p>
                  <p class="text-white text-sm font-medium">{{ issuedDisplay }}</p>
                </div>
                <div class="px-6 py-3 border-r border-white/5">
                  <p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Due Date</p>
                  <p :class="['text-sm font-medium', isOverdue ? 'text-red-400' : 'text-white']">{{ dueDateDisplay }}</p>
                </div>
                <div class="px-6 py-3">
                  <p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Currency</p>
                  <p class="text-white text-sm font-medium">{{ invoice.currency || 'USD' }}</p>
                </div>
              </div>

              <!-- From / Bill To -->
              <div class="grid grid-cols-2 border-b border-white/5">
                <div class="px-6 py-5 border-r border-white/5">
                  <p class="text-white/30 text-[10px] uppercase tracking-widest mb-2">From</p>
                  <p class="text-white font-bold">CharaTech Ltd.</p>
                  <p class="text-white/50 text-sm mt-0.5">info@charatech.com</p>
                  <p class="text-white/50 text-sm">chara-tech-web.vercel.app</p>
                </div>
                <div class="px-6 py-5">
                  <p class="text-white/30 text-[10px] uppercase tracking-widest mb-2">Bill To</p>
                  <p class="text-white font-bold">{{ invoice.client?.fullName || invoice.client?.email || 'Client' }}</p>
                  <p class="text-white/50 text-sm mt-0.5">{{ invoice.client?.email }}</p>
                  <p class="text-white/50 text-sm">{{ invoice.client?.companyName }}</p>
                </div>
              </div>

              <!-- Items -->
              <div class="px-6 pt-6 pb-4">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-white/8">
                      <th class="text-left text-white/30 uppercase text-xs tracking-wider pb-3 font-medium">Description</th>
                      <th class="text-center text-white/30 uppercase text-xs tracking-wider pb-3 font-medium w-16">Qty</th>
                      <th class="text-right text-white/30 uppercase text-xs tracking-wider pb-3 font-medium w-28">Unit Price</th>
                      <th class="text-right text-white/30 uppercase text-xs tracking-wider pb-3 font-medium w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, i) in parsedItems"
                      :key="i"
                      :class="['border-b border-white/5', i % 2 !== 0 ? 'bg-white/[0.01]' : '']"
                    >
                      <td class="py-3 text-white/80 pr-4">{{ item.description }}</td>
                      <td class="py-3 text-center text-white/50">{{ item.quantity }}</td>
                      <td class="py-3 text-right text-white/60 tabular-nums">{{ formatCurrency(item.unitPrice) }}</td>
                      <td class="py-3 text-right text-white font-semibold tabular-nums">{{ formatCurrency(item.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Totals -->
              <div class="px-6 pb-6 flex justify-end">
                <div class="w-64 space-y-2">
                  <div class="flex justify-between text-sm text-white/50">
                    <span>Subtotal</span>
                    <span class="tabular-nums">{{ formatCurrency(invoice.amount) }}</span>
                  </div>
                  <div v-if="invoice.taxAmount" class="flex justify-between text-sm text-white/50">
                    <span>Tax</span>
                    <span class="tabular-nums">{{ formatCurrency(invoice.taxAmount) }}</span>
                  </div>
                  <div class="flex justify-between items-baseline pt-3 border-t border-purple-500/25">
                    <span class="text-white font-bold">Total Due</span>
                    <span
                      class="text-3xl font-black text-purple-300 tabular-nums"
                      style="text-shadow: 0 0 20px rgba(168,85,247,0.9), 0 0 40px rgba(168,85,247,0.4);"
                    >{{ formatCurrency(invoice.totalAmount) }}</span>
                  </div>
                  <div v-if="invoice.paidAt" class="flex justify-between text-sm text-green-400">
                    <span>Paid on</span>
                    <span>{{ formatDate(invoice.paidAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="invoice.notes" class="px-6 py-4 border-t border-white/5">
                <p class="text-white/30 text-[10px] uppercase tracking-widest mb-2">Notes</p>
                <p class="text-white/60 text-sm whitespace-pre-wrap leading-relaxed">{{ invoice.notes }}</p>
              </div>

              <!-- Footer -->
              <div
                class="px-6 py-4 text-center border-t border-white/5"
                style="background: linear-gradient(90deg, rgba(88,28,135,0.15) 0%, rgba(190,24,93,0.1) 100%);"
              >
                <p class="text-white/25 text-xs tracking-widest uppercase">
                  Thank you for choosing CharaTech · info@charatech.com
                </p>
              </div>
            </div>
          </GlowingScrollbar>

          <!-- Footer actions -->
          <div
            class="flex-shrink-0 border-t border-white/8 px-7 py-4 flex items-center justify-between gap-3"
            style="background: rgba(0,0,0,0.35);"
          >
            <p v-if="actionError" class="text-red-400 text-xs">⚠ {{ actionError }}</p>
            <div v-else class="text-white/25 text-xs">
              Invoice · {{ formatCurrency(invoice.totalAmount) }} · {{ invoice.status }}
            </div>

            <div class="flex items-center gap-2">
              <!-- Cancel invoice -->
              <button
                v-if="['DRAFT','SENT','OVERDUE'].includes(invoice.status)"
                @click="updateStatus('CANCELLED')"
                :disabled="actionLoading"
                class="px-4 py-2 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-400 transition border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5"
              >
                Cancel Invoice
              </button>

              <!-- Mark Overdue -->
              <button
                v-if="invoice.status === 'SENT'"
                @click="updateStatus('OVERDUE')"
                :disabled="actionLoading"
                class="px-4 py-2 rounded-xl text-xs font-medium text-orange-400/70 hover:text-orange-400 transition border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5"
              >
                Mark Overdue
              </button>

              <!-- Send -->
              <button
                v-if="invoice.status === 'DRAFT'"
                @click="updateStatus('SENT')"
                :disabled="actionLoading"
                class="px-5 py-2 rounded-xl text-xs font-semibold text-blue-300 hover:text-white transition border border-blue-500/30 hover:border-blue-500 hover:bg-blue-600/20 flex items-center gap-1.5"
              >
                <span v-if="actionLoading">Sending…</span>
                <span v-else>📨 Send to Client</span>
              </button>

              <!-- Mark Paid -->
              <button
                v-if="['SENT','OVERDUE'].includes(invoice.status)"
                @click="updateStatus('PAID')"
                :disabled="actionLoading"
                class="px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5"
                style="background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 0 16px rgba(16,185,129,0.3);"
              >
                <span v-if="actionLoading">Updating…</span>
                <span v-else>✓ Mark as Paid</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import GlowingScrollbar from '@/components/ui/GlowingScrollbar.vue'

interface Props {
  show: boolean
  invoice: any | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: [invoice: any]
}>()

const { getAccessToken } = useAuth()
const actionLoading = ref(false)
const actionError = ref('')

// ── Computed ────────────────────────────────────────────────
const currency = computed(() => props.invoice?.currency || 'USD')

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', GHS: '₵', CAD: 'C$', AUD: 'A$',
}
const formatCurrency = (amount: number) => {
  const sym = currencySymbols[currency.value] || '$'
  return `${sym}${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

const formatDate = (d: string | Date) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

const issuedDisplay = computed(() => formatDate(props.invoice?.createdAt))
const dueDateDisplay = computed(() => props.invoice?.dueDate ? formatDate(props.invoice.dueDate) : '—')
const isOverdue = computed(() => {
  if (!props.invoice?.dueDate) return false
  return new Date(props.invoice.dueDate) < new Date() && props.invoice.status !== 'PAID'
})

const parsedItems = computed(() => {
  const raw = props.invoice?.items
  if (!raw) return []
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return Array.isArray(raw) ? raw : []
})

const statusClass = computed(() => {
  const map: Record<string, string> = {
    DRAFT:     'bg-gray-500/20 text-gray-300',
    SENT:      'bg-blue-500/20 text-blue-300',
    PAID:      'bg-green-500/20 text-green-300',
    OVERDUE:   'bg-red-500/20 text-red-300',
    CANCELLED: 'bg-gray-500/20 text-gray-400 line-through',
  }
  return map[props.invoice?.status] || 'bg-gray-500/20 text-gray-300'
})

// ── Actions ─────────────────────────────────────────────────
const updateStatus = async (status: string) => {
  actionLoading.value = true
  actionError.value = ''
  try {
    const token = await getAccessToken()
    const result = await $fetch<{ success: boolean; invoice: any }>(
      `/api/admin/invoices/${props.invoice.id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { status },
      }
    )
    emit('updated', result.invoice)
  } catch (err: any) {
    actionError.value = err?.data?.message || err.message || 'Failed to update invoice.'
  } finally {
    actionLoading.value = false
  }
}

const printInvoice = () => {
  const el = document.getElementById('invoice-print-area')
  if (!el) return
  const win = window.open('', '_blank')!
  win.document.write(`
    <html>
      <head>
        <title>${props.invoice?.invoiceNumber || 'Invoice'} — CharaTech</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body { font-family: Inter, sans-serif; background: #0c0820; color: white; padding: 32px; }
        </style>
      </head>
      <body>${el.outerHTML}</body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 500)
}
</script>

<style scoped>
.modal-enter-active {
  animation: modal-in 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.modal-leave-active {
  animation: modal-in 0.2s ease-in reverse;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
