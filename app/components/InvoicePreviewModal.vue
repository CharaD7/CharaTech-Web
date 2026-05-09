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
                       :class="['border-b border-white/5', (i as number) % 2 !== 0 ? 'bg-white/[0.01]' : '']"
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
              <div v-if="displayNotes" class="px-6 py-4 border-t border-white/5">
                <p class="text-white/30 text-[10px] uppercase tracking-widest mb-2">Notes</p>
                <p class="text-white/60 text-sm whitespace-pre-wrap leading-relaxed">{{ displayNotes }}</p>
              </div>

              <!-- Submission Summary -->
              <div v-if="invoice.submission" class="px-6 py-4 border-t border-white/5">
                <button
                  @click="showSummary = !showSummary"
                  class="flex items-center gap-2 w-full text-left transition"
                >
                  <span class="text-white/30 text-[10px] uppercase tracking-widest font-semibold">Submission Summary</span>
                  <svg class="w-3.5 h-3.5 text-white/30 ml-auto transition-transform duration-200" :class="{ 'rotate-180': showSummary }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div v-if="showSummary" class="mt-3 space-y-3">
                  <!-- Project Brief -->
                  <div v-if="invoice.submission.projectBrief" class="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Project Brief</p>
                    <p class="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{{ invoice.submission.projectBrief }}</p>
                  </div>

                  <!-- Audio Brief -->
                  <div v-if="invoice.submission.audioBrief" class="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <span>🎤</span> Audio Recording
                      <span v-if="invoice.submission.audioFileName" class="text-white/20 font-normal">({{ invoice.submission.audioFileName }})</span>
                    </p>
                    <audio controls class="w-full max-w-sm rounded" :src="invoice.submission.audioBrief">
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  <!-- Attachments -->
                  <div v-if="invoice.submission.attachments?.length" class="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span>📎</span> Attachments ({{ invoice.submission.attachments.length }})
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <a
                        v-for="att in invoice.submission.attachments"
                        :key="att.id"
                        :href="att.fileUrl"
                        target="_blank"
                        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-xs"
                      >
                        <span>{{ att.type === 'IMAGE' ? '🖼️' : att.type === 'VIDEO' ? '🎬' : '🔗' }}</span>
                        <span class="text-white/60 truncate max-w-[120px]">{{ att.fileName || att.type }}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Reference (client only) -->
              <div v-if="mode === 'client' && invoice.submission" class="px-6 py-4 border-t border-white/5 bg-purple-900/10">
                <p class="text-purple-300 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Payment Reference</p>
                <div class="flex items-center gap-2">
                  <code class="text-white font-mono text-sm select-all flex-1">{{ invoice.submission.projectName }}-{{ invoice.invoiceNumber }}</code>
                  <button @click="copyPaymentRef" class="text-purple-400 hover:text-purple-300 text-xs px-2 py-1 rounded hover:bg-purple-500/20 transition">
                    Copy
                  </button>
                </div>
              </div>

              <!-- Payment Milestones (client only) -->
              <div v-if="milestones.length > 0 && invoice.status !== 'DRAFT' && invoice.status !== 'CANCELLED'" class="px-6 py-4 border-t border-white/5 space-y-3">
                <p class="text-white/30 text-[10px] uppercase tracking-widest font-semibold">Payment Milestones</p>
                <div
                  v-for="ms in milestones"
                  :key="ms.id"
                  :class="['rounded-xl p-3 border transition-all', milestoneClass(ms)]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-white">{{ ms.label }}</span>
                      <BaseBadge v-if="isMilestoneApproved(ms)" variant="success" size="sm">Confirmed</BaseBadge>
                      <BaseBadge v-else-if="isMilestonePaid(ms)" variant="warning" size="sm">Awaiting Review</BaseBadge>
                    </div>
                    <span class="text-purple-300 font-bold text-sm">{{ formatCurrency(milestoneAmount(ms)) }}</span>
                  </div>
                  <div v-if="!isMilestonePaid(ms)">
                    <BaseButton size="sm" variant="primary" @click="$emit('upload-proof', ms.id, milestoneAmount(ms))">
                      Upload Proof
                    </BaseButton>
                  </div>
                </div>
              </div>

              <!-- Admin Milestone Controls -->
              <div v-if="mode === 'admin' && milestones.length > 0" class="px-6 py-4 border-t border-white/5 space-y-3">
                <p class="text-white/30 text-[10px] uppercase tracking-widest font-semibold">Milestone Management</p>
                <div
                  v-for="ms in milestones"
                  :key="ms.id"
                  class="rounded-lg bg-white/5 border border-white/10 overflow-hidden"
                >
                  <div class="flex items-center justify-between p-3">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-white/80">{{ ms.label }}</span>
                      <span class="text-purple-400 text-xs font-mono ml-1">{{ ms.percentage }}%</span>
                      <BaseBadge v-if="isMilestoneApproved(ms)" variant="success" size="sm">Approved</BaseBadge>
                      <BaseBadge v-else-if="isMilestonePaid(ms)" variant="warning" size="sm">Paid (unverified)</BaseBadge>
                      <BaseBadge v-else variant="default" size="sm">Pending</BaseBadge>
                    </div>
                    <div class="flex gap-1.5">
                      <BaseButton
                        v-if="!isMilestonePaid(ms)"
                        size="sm"
                        variant="primary"
                        :disabled="actionLoading"
                        @click="markMilestonePaid(ms.id)"
                      >Mark Paid</BaseButton>
                      <BaseButton
                        v-if="isMilestonePaid(ms) && !isMilestoneApproved(ms)"
                        size="sm"
                        variant="primary"
                        :disabled="actionLoading"
                        @click="approveMilestoneAction(ms.id)"
                      >Approve</BaseButton>
                      <BaseButton
                        v-if="isMilestonePaid(ms) || isMilestoneApproved(ms)"
                        size="sm"
                        variant="danger"
                        :disabled="actionLoading"
                        @click="unmarkMilestone(ms.id)"
                      >Unmark</BaseButton>
                    </div>
                  </div>

                  <!-- Payment Proofs for this milestone -->
                  <div v-if="proofsForMilestone(ms.id).length > 0" class="border-t border-white/5 px-3 py-2 space-y-1.5">
                    <p class="text-white/20 text-[10px] uppercase tracking-widest">Payment Proofs</p>
                    <div
                      v-for="proof in proofsForMilestone(ms.id)"
                      :key="proof.id"
                      class="flex items-center justify-between p-2 rounded bg-white/[0.03] border border-white/5"
                    >
                      <div class="flex items-center gap-2 min-w-0">
                        <BaseTooltip :text="proof.fileUrl">
                          <a
                            :href="proof.fileUrl"
                            target="_blank"
                            class="text-purple-400 hover:text-purple-300 text-xs truncate max-w-[160px] underline underline-offset-2"
                          >{{ proof.fileName || proof.fileType || 'View File' }}</a>
                        </BaseTooltip>
                        <BaseBadge
                          v-if="proof.status === 'APPROVED'"
                          variant="success"
                          size="sm"
                        >Approved</BaseBadge>
                        <BaseBadge
                          v-else-if="proof.status === 'REJECTED'"
                          variant="danger"
                          size="sm"
                        >Rejected</BaseBadge>
                        <BaseBadge v-else variant="warning" size="sm">Pending</BaseBadge>
                      </div>
                      <div v-if="proof.status === 'PENDING'" class="flex gap-1 flex-shrink-0">
                        <BaseButton
                          size="sm"
                          variant="primary"
                          :disabled="actionLoading"
                          @click="approveProof(proof.id)"
                        >✓</BaseButton>
                        <BaseButton
                          size="sm"
                          variant="danger"
                          :disabled="actionLoading"
                          @click="rejectProof(proof.id)"
                        >✕</BaseButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Info Request Banner (client only) -->
              <div v-if="mode === 'client' && invoice.infoRequestType && !invoice.infoRequestResolved" class="px-6 py-4 border-t border-white/5 bg-blue-900/10">
                <p class="text-blue-300 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">Your Request</p>
                <p class="text-white/70 text-sm">
                  {{ invoice.infoRequestType === 'MORE_INFO' ? 'More information' : 'Alternate bank account' }} requested
                  <span v-if="invoice.infoRequestMessage">— {{ invoice.infoRequestMessage }}</span>
                </p>
                <p class="text-white/40 text-xs mt-1">Our team will respond shortly.</p>
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

            <!-- Admin actions -->
            <div v-if="mode === 'admin'" class="flex items-center gap-2">
              <button
                v-if="['DRAFT','SENT','OVERDUE'].includes(invoice.status)"
                @click="updateStatus('CANCELLED')"
                :disabled="actionLoading"
                class="px-4 py-2 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-400 transition border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5"
              >
                Cancel Invoice
              </button>
              <button
                v-if="invoice.status === 'SENT'"
                @click="updateStatus('OVERDUE')"
                :disabled="actionLoading"
                class="px-4 py-2 rounded-xl text-xs font-medium text-orange-400/70 hover:text-orange-400 transition border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5"
              >
                Mark Overdue
              </button>
              <button
                v-if="invoice.status === 'DRAFT'"
                @click="updateStatus('SENT')"
                :disabled="actionLoading"
                class="px-5 py-2 rounded-xl text-xs font-semibold text-blue-300 hover:text-white transition border border-blue-500/30 hover:border-blue-500 hover:bg-blue-600/20 flex items-center gap-1.5"
              >
                <span v-if="actionLoading">Sending…</span>
                <span v-else>📨 Send to Client</span>
              </button>
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

            <!-- Client actions -->
            <div v-else class="flex items-center gap-2">
              <button
                v-if="['SENT','OVERDUE'].includes(invoice.status)"
                @click="$emit('request-info')"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-blue-300 hover:text-white transition border border-blue-500/30 hover:border-blue-500 hover:bg-blue-600/20"
              >
                Request Info
              </button>
              <a
                href="mailto:hello@charatech.com"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5"
                style="background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(219,39,119,0.3)); border: 1px solid rgba(168,85,247,0.3);"
              >
                Contact CharaTech
              </a>
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
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTooltip from '@/components/ui/BaseTooltip.vue'

interface Props {
  show: boolean
  invoice: any | null
  mode?: 'admin' | 'client'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'admin',
})
const emit = defineEmits<{
  close: []
  updated: [invoice: any]
  'upload-proof': [phase: string, amount: number]
  'request-info': []
}>()

const { getAccessToken } = useAuth()
const actionLoading = ref(false)
const actionError = ref('')
const showSummary = ref(false)
const displayProofId = ref<string | null>(null)

const hasCustomMilestones = computed(() => {
  const ms = props.invoice?.milestones
  return Array.isArray(ms) && ms.length > 0
})

const proofsForMilestone = (phase: string) => {
  const proofs = props.invoice?.paymentProofs
  if (!Array.isArray(proofs)) return []
  return proofs.filter((p: any) => p.phase === phase)
}

// ── Computed ────────────────────────────────────────────────
const currency = computed(() => props.invoice?.currency || 'USD')

const displayNotes = computed(() => {
  const notes = props.invoice?.notes || ''
  const num = props.invoice?.invoiceNumber || ''
  return notes
    .replace(/\[Invoice Number\]/g, num)
    .replace(/—\s*\[Invoice Number\]/g, num ? `—${num}` : '')
})

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

const milestones = computed(() => {
  const raw = props.invoice?.milestones
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((m: any) => ({
      ...m,
      id: m.id || m.phase,
    }))
  }
  return [
    { id: 'ADVANCE_60', phase: 'ADVANCE_60', label: 'Advance Payment', percentage: 60 },
    { id: 'FINAL_40', phase: 'FINAL_40', label: 'Final Payment', percentage: 40 },
  ]
})

const isMilestonePaid = (ms: any) => {
  if (hasCustomMilestones.value) {
    return !!ms.paidAt
  }
  const field = ms.phase === 'ADVANCE_60' ? 'advancePaidAt' : ms.phase === 'FINAL_40' ? 'finalPaidAt' : null
  return field ? !!props.invoice?.[field] : false
}

const isMilestoneApproved = (ms: any) => {
  if (hasCustomMilestones.value) {
    return !!ms.approvedAt
  }
  const field = ms.phase === 'ADVANCE_60' ? 'advanceApprovedAt' : ms.phase === 'FINAL_40' ? 'finalApprovedAt' : null
  return field ? !!props.invoice?.[field] : false
}

const milestoneAmount = (ms: any) => Number(props.invoice?.totalAmount || 0) * ((ms.percentage || 0) / 100)

const milestoneClass = (ms: any) => {
  if (isMilestoneApproved(ms)) return 'border-green-500/30 bg-green-500/10'
  if (isMilestonePaid(ms)) return 'border-yellow-500/30 bg-yellow-500/10'
  return 'border-white/10 bg-white/5'
}

const copyPaymentRef = async () => {
  if (!props.invoice?.submission) return
  const ref = `${props.invoice.submission.projectName}-${props.invoice.invoiceNumber}`
  await navigator.clipboard.writeText(ref)
}

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

const refetchInvoice = async () => {
  const token = await getAccessToken()
  const updated = await $fetch(`/api/invoices/${props.invoice.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  emit('updated', (updated as any).invoice)
}

const markMilestonePaid = async (phase: string) => {
  actionLoading.value = true
  actionError.value = ''
  try {
    const token = await getAccessToken()
    await $fetch(`/api/admin/invoices/${props.invoice.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { markMilestone: phase },
    })
    await refetchInvoice()
  } catch (err: any) {
    actionError.value = err?.data?.message || err.message || 'Failed to mark milestone.'
  } finally {
    actionLoading.value = false
  }
}

const approveMilestoneAction = async (phase: string) => {
  actionLoading.value = true
  actionError.value = ''
  try {
    const token = await getAccessToken()
    await $fetch(`/api/admin/invoices/${props.invoice.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { approveMilestone: phase },
    })
    await refetchInvoice()
  } catch (err: any) {
    actionError.value = err?.data?.message || err.message || 'Failed to approve milestone.'
  } finally {
    actionLoading.value = false
  }
}

const unmarkMilestone = async (phase: string) => {
  actionLoading.value = true
  actionError.value = ''
  try {
    const token = await getAccessToken()
    await $fetch(`/api/admin/invoices/${props.invoice.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { unmarkMilestone: phase },
    })
    await refetchInvoice()
  } catch (err: any) {
    actionError.value = err?.data?.message || err.message || 'Failed to unmark milestone.'
  } finally {
    actionLoading.value = false
  }
}

const approveProof = async (proofId: string) => {
  actionLoading.value = true
  actionError.value = ''
  try {
    const token = await getAccessToken()
    await $fetch(`/api/admin/invoices/${props.invoice.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { approveProof: 'APPROVED', proofId },
    })
    await refetchInvoice()
  } catch (err: any) {
    actionError.value = err?.data?.message || err.message || 'Failed to approve proof.'
  } finally {
    actionLoading.value = false
  }
}

const rejectProof = async (proofId: string) => {
  actionLoading.value = true
  actionError.value = ''
  try {
    const token = await getAccessToken()
    await $fetch(`/api/admin/invoices/${props.invoice.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { approveProof: 'REJECTED', proofId },
    })
    await refetchInvoice()
  } catch (err: any) {
    actionError.value = err?.data?.message || err.message || 'Failed to reject proof.'
  } finally {
    actionLoading.value = false
  }
}

const printInvoice = () => {
  const inv = props.invoice
  if (!inv) return

  const parsedItems = (() => {
    const raw = inv?.items
    if (!raw) return []
    if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return [] } }
    return Array.isArray(raw) ? raw : []
  })()

  const curr = inv.currency || 'USD'
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', GHS: '₵', CAD: 'C$', AUD: 'A$' }
  const sym = symbols[curr] || '$'
  const fmt = (n: number) => `${sym}${(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  const subtotal = inv.amount || 0
  const tax = inv.taxAmount || 0
  const total = inv.totalAmount || 0
  const taxRate = subtotal > 0 ? Math.round((tax / subtotal) * 10000) / 100 : 0

  const itemsHtml = parsedItems.length
    ? parsedItems.map((item: any, i: number) => `
        <tr style="${i % 2 !== 0 ? 'background:#f8f6fc;' : ''}">
          <td style="padding:12px 16px;color:#1f1f2e;font-size:13px;">${item.description || '—'}</td>
          <td style="padding:12px 16px;text-align:center;color:#6b6b80;font-size:13px;">${item.quantity || 1}</td>
          <td style="padding:12px 16px;text-align:right;color:#6b6b80;font-size:13px;font-variant-numeric:tabular-nums;">${fmt(item.unitPrice || 0)}</td>
          <td style="padding:12px 16px;text-align:right;color:#1f1f2e;font-weight:600;font-size:13px;font-variant-numeric:tabular-nums;">${fmt(item.total || 0)}</td>
        </tr>`).join('')
    : `<tr><td colspan="4" style="padding:24px;text-align:center;color:#aaa;font-style:italic;font-size:13px;">No items</td></tr>`

  const clientName = inv.client?.fullName || inv.client?.email || 'Client'
  const clientEmail = inv.client?.email || ''
  const clientCompany = inv.client?.companyName || ''

  const statusColor: Record<string, string> = {
    DRAFT: '#6b7280', SENT: '#3b82f6', PAID: '#10b981', OVERDUE: '#ef4444', CANCELLED: '#9ca3af'
  }
  const sc = statusColor[inv.status] || '#6b7280'

  const processedNotes = (inv.notes || '')
    .replace(/\[Invoice Number\]/g, inv.invoiceNumber)
    .replace(/—\s*\[Invoice Number\]/g, inv.invoiceNumber ? `—${inv.invoiceNumber}` : '')

  const notesHtml = processedNotes ? `
    <div style="padding:20px 32px;border-top:1px solid #e8e4f0;">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:6px;font-weight:600;">Notes</div>
      <div style="color:#4a4a5a;font-size:12px;white-space:pre-wrap;line-height:1.7;">${processedNotes}</div>
    </div>` : ''

  const printMilestones = (() => {
    const raw = inv.milestones
    if (Array.isArray(raw) && raw.length > 0) return raw
    return [
      { id: 'ADVANCE_60', phase: 'ADVANCE_60', label: 'Advance Payment', percentage: 60 },
      { id: 'FINAL_40', phase: 'FINAL_40', label: 'Final Payment', percentage: 40 },
    ]
  })()

  const isMsPaid = (ms: any) => {
    if (Array.isArray(inv.milestones) && inv.milestones.length > 0) return !!ms.paidAt
    return ms.phase === 'ADVANCE_60' ? !!inv.advancePaidAt : ms.phase === 'FINAL_40' ? !!inv.finalPaidAt : false
  }
  const isMsApproved = (ms: any) => {
    if (Array.isArray(inv.milestones) && inv.milestones.length > 0) return !!ms.approvedAt
    return ms.phase === 'ADVANCE_60' ? !!inv.advanceApprovedAt : ms.phase === 'FINAL_40' ? !!inv.finalApprovedAt : false
  }

  const milestonesHtml = inv.status !== 'DRAFT' && inv.status !== 'CANCELLED' && printMilestones.length > 0 ? `
    <div style="padding:20px 32px;border-top:1px solid #e8e4f0;">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:12px;font-weight:600;">Payment Milestones</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        ${printMilestones.map((ms: any) => {
          const msPaid = isMsPaid(ms)
          const msApproved = isMsApproved(ms)
          const borderColor = msApproved ? '#d1fae5' : msPaid ? '#fef3c7' : '#e8e4f0'
          const bgColor = msApproved ? '#f0fdf4' : msPaid ? '#fffbeb' : '#faf8ff'
          const badge = msApproved ? '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#d1fae5;color:#059669;font-weight:600;">Confirmed</span>' :
            msPaid ? '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#fef3c7;color:#d97706;font-weight:600;">Awaiting Review</span>' :
            '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#f3f4f6;color:#6b7280;font-weight:600;">Pending</span>'
          const msAmount = total * ((ms.percentage || 0) / 100)
          return `
        <div style="flex:1;min-width:160px;padding:14px;border-radius:10px;border:1.5px solid ${borderColor};background:${bgColor};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:13px;font-weight:700;color:#1f1f2e;">${ms.label}</span>
              ${badge}
            </div>
            <span style="font-weight:800;color:#7c3aed;font-size:14px;">${fmt(msAmount)}</span>
          </div>
        </div>`
        }).join('')}
      </div>
    </div>` : ''

  const paidHtml = inv.paidAt ? `
    <div style="display:flex;justify-content:space-between;font-size:13px;color:#10b981;">
      <span>Paid on</span>
      <span style="font-variant-numeric:tabular-nums;">${fmtDate(inv.paidAt)}</span>
    </div>` : ''

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${inv.invoiceNumber} — CharaTech</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { margin: 0; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #1f1f2e; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;min-height:100vh;">

    <!-- Header Band -->
    <div style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#db2777 100%);padding:36px 40px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#fff;">CHARATECH</div>
          <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-top:2px;">Software Requirements Platform</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:4px;">Invoice</div>
          <div style="font-size:22px;font-weight:800;color:#fff;">${inv.invoiceNumber}</div>
          <div style="margin-top:8px;display:inline-block;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;background:${sc};">${inv.status}</div>
        </div>
      </div>
    </div>

    <!-- Meta Strip -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #e8e4f0;background:#faf8ff;">
      <div style="padding:14px 24px;border-right:1px solid #e8e4f0;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:3px;font-weight:600;">Issue Date</div>
        <div style="font-size:13px;font-weight:600;color:#1f1f2e;">${fmtDate(inv.createdAt)}</div>
      </div>
      <div style="padding:14px 24px;border-right:1px solid #e8e4f0;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:3px;font-weight:600;">Due Date</div>
        <div style="font-size:13px;font-weight:600;color:${inv.status === 'OVERDUE' ? '#ef4444' : '#1f1f2e'};">${inv.dueDate ? fmtDate(inv.dueDate) : '—'}</div>
      </div>
      <div style="padding:14px 24px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:3px;font-weight:600;">Currency</div>
        <div style="font-size:13px;font-weight:600;color:#1f1f2e;">${curr}</div>
      </div>
    </div>

    <!-- From / Bill To -->
    <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e8e4f0;">
      <div style="padding:24px 32px;border-right:1px solid #e8e4f0;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:8px;font-weight:600;">From</div>
        <div style="font-size:14px;font-weight:700;color:#1f1f2e;">CharaTech Ltd.</div>
        <div style="font-size:12px;color:#6b6b80;margin-top:3px;">info@charatech.com</div>
        <div style="font-size:12px;color:#6b6b80;">chara-tech-web.vercel.app</div>
      </div>
      <div style="padding:24px 32px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:8px;font-weight:600;">Bill To</div>
        <div style="font-size:14px;font-weight:700;color:#1f1f2e;">${clientName}</div>
        <div style="font-size:12px;color:#6b6b80;margin-top:3px;">${clientEmail}</div>
        <div style="font-size:12px;color:#6b6b80;">${clientCompany}</div>
      </div>
    </div>

    ${inv.submission ? `
    <div style="padding:12px 32px;border-bottom:1px solid #e8e4f0;background:#faf8ff;display:flex;align-items:center;gap:10px;">
      <span style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;font-weight:600;">Project:</span>
      <span style="font-size:13px;font-weight:600;color:#7c3aed;">${inv.submission.projectName || '—'}</span>
    </div>` : ''}

    <!-- Line Items -->
    <div style="padding:24px 32px 16px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e8e4f0;">
            <th style="text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9b8fb0;padding-bottom:10px;font-weight:600;">Description</th>
            <th style="text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9b8fb0;padding-bottom:10px;font-weight:600;width:60px;">Qty</th>
            <th style="text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9b8fb0;padding-bottom:10px;font-weight:600;width:100px;">Unit Price</th>
            <th style="text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#9b8fb0;padding-bottom:10px;font-weight:600;width:100px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="padding:0 32px 24px;display:flex;justify-content:flex-end;">
      <div style="width:240px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b6b80;margin-bottom:6px;">
          <span>Subtotal</span>
          <span style="font-variant-numeric:tabular-nums;">${fmt(subtotal)}</span>
        </div>
        ${tax > 0 ? `
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b6b80;margin-bottom:6px;">
          <span>Tax (${taxRate}%)</span>
          <span style="font-variant-numeric:tabular-nums;">${fmt(tax)}</span>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:12px;border-top:2px solid #e8e4f0;margin-top:8px;">
          <span style="font-weight:700;font-size:14px;color:#1f1f2e;">Total Due</span>
          <span style="font-size:26px;font-weight:900;color:#7c3aed;font-variant-numeric:tabular-nums;">${fmt(total)}</span>
        </div>
        ${paidHtml}
      </div>
    </div>

    ${notesHtml}

    <!-- Submission Summary (print) -->
    ${inv.submission ? `
    <div style="padding:20px 32px;border-top:1px solid #e8e4f0;">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#9b8fb0;margin-bottom:10px;font-weight:600;">Submission Summary</div>
      ${inv.submission.projectBrief ? `
      <div style="margin-bottom:10px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#b0a8c0;margin-bottom:4px;">Project Brief</div>
        <div style="color:#4a4a5a;font-size:11px;white-space:pre-wrap;line-height:1.6;">${inv.submission.projectBrief}</div>
      </div>` : ''}
      ${inv.submission.audioBrief ? `
      <div style="margin-bottom:10px;">
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#b0a8c0;margin-bottom:4px;">Audio Recording${inv.submission.audioFileName ? ` (${inv.submission.audioFileName})` : ''}</div>
        <div style="font-size:11px;color:#7c3aed;">Audio file available in the online preview.</div>
      </div>` : ''}
      ${inv.submission.attachments?.length ? `
      <div>
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#b0a8c0;margin-bottom:4px;">Attachments (${inv.submission.attachments.length})</div>
        <div style="font-size:11px;color:#4a4a5a;">
          ${inv.submission.attachments.map((a: any) => `<div style="padding:2px 0;">${a.type === 'IMAGE' ? '🖼️' : a.type === 'VIDEO' ? '🎬' : '🔗'} ${a.fileName || a.type}</div>`).join('')}
        </div>
      </div>` : ''}
    </div>` : ''}

    ${milestonesHtml}

    <!-- Footer -->
    <div style="padding:20px 40px;text-align:center;border-top:1px solid #e8e4f0;background:linear-gradient(90deg,#f5f0ff 0%,#fdf2f8 100%);">
      <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9b8fb0;">Thank you for choosing CharaTech · info@charatech.com</p>
    </div>
  </div>
</body>
</html>`

  const win = window.open('', '_blank')!
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 600)
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
