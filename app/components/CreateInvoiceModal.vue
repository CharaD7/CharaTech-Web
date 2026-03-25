<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto"
        style="padding-top: max(1rem, env(safe-area-inset-top));"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/80 backdrop-blur-md"
          @click="close"
        />

        <!-- Modal -->
        <div
          class="relative w-full max-w-[1400px] my-4 flex flex-col rounded-2xl overflow-hidden border border-purple-500/20"
          style="background: linear-gradient(135deg, rgba(12,8,32,0.98) 0%, rgba(22,8,48,0.98) 100%); box-shadow: 0 0 120px rgba(168,85,247,0.15), 0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05);"
        >
          <!-- ═══ HEADER ═══ -->
          <div
            class="flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-purple-500/20"
            style="background: linear-gradient(90deg, rgba(88,28,135,0.6) 0%, rgba(126,34,206,0.4) 50%, rgba(190,24,93,0.3) 100%);"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style="background: linear-gradient(135deg, #7c3aed, #db2777); box-shadow: 0 0 24px rgba(168,85,247,0.5);"
              >
                🧾
              </div>
              <div>
                <h2 class="text-xl font-bold text-white leading-tight">Create Professional Invoice</h2>
                <p class="text-purple-300/60 text-xs tracking-widest uppercase">CharaTech · Software Requirements Platform</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <!-- Step pills -->
              <div class="hidden md:flex items-center gap-2 mr-4">
                <div
                  v-for="(step, i) in ['Client', 'Items', 'Pricing', 'Details']"
                  :key="step"
                  class="flex items-center gap-1.5"
                >
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                      isStepComplete(i)
                        ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                        : 'bg-white/10 text-white/40'
                    ]"
                  >{{ i + 1 }}</div>
                  <span :class="['text-xs', isStepComplete(i) ? 'text-purple-300' : 'text-white/30']">{{ step }}</span>
                  <span v-if="i < 3" class="text-white/20 text-xs ml-1">›</span>
                </div>
              </div>
              <button
                @click="close"
                class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition border border-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- ═══ BODY (form + preview) ═══ -->
          <div class="flex min-h-0" style="max-height: calc(90vh - 130px);">

            <!-- ── LEFT: FORM ── -->
            <div class="w-full lg:w-[52%] overflow-y-auto p-6 space-y-5" style="scrollbar-width: thin; scrollbar-color: rgba(168,85,247,0.3) transparent;">

              <!-- SECTION: Client & Project -->
              <div class="rounded-xl border border-white/8 overflow-hidden" style="background: rgba(255,255,255,0.02);">
                <div class="px-5 py-3 border-b border-white/5 flex items-center gap-2"
                  style="background: rgba(168,85,247,0.06);">
                  <span class="text-purple-400">👤</span>
                  <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider">Client & Project</h3>
                </div>
                <div class="p-5 space-y-4">
                  <!-- Submission selector -->
                  <div>
                    <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Link to Submission <span class="text-red-400">*</span></label>
                    <div class="relative">
                      <select
                        v-model="form.submissionId"
                        class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 appearance-none pr-10"
                        :style="neuInput"
                        :class="{ 'ring-2 ring-purple-500/60': form.submissionId }"
                      >
                        <option value="" class="bg-gray-900">— Select a submission —</option>
                        <option
                          v-for="sub in submissions"
                          :key="sub.id"
                          :value="sub.id"
                          class="bg-gray-900"
                        >
                          {{ sub.projectName }} · {{ sub.user?.email }}
                        </option>
                      </select>
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">▾</div>
                    </div>
                  </div>

                  <!-- Auto-filled client info -->
                  <Transition name="fade-slide">
                    <div
                      v-if="selectedSub"
                      class="grid grid-cols-2 gap-3 p-4 rounded-xl border border-purple-500/15"
                      style="background: rgba(168,85,247,0.05);"
                    >
                      <div>
                        <p class="text-white/30 text-xs uppercase tracking-wider mb-0.5">Client</p>
                        <p class="text-white font-medium text-sm">{{ selectedSub.user?.fullName || selectedSub.user?.email }}</p>
                      </div>
                      <div>
                        <p class="text-white/30 text-xs uppercase tracking-wider mb-0.5">Email</p>
                        <p class="text-white/70 text-sm truncate">{{ selectedSub.user?.email }}</p>
                      </div>
                      <div>
                        <p class="text-white/30 text-xs uppercase tracking-wider mb-0.5">Company</p>
                        <p class="text-white/70 text-sm">{{ selectedSub.user?.companyName || '—' }}</p>
                      </div>
                      <div>
                        <p class="text-white/30 text-xs uppercase tracking-wider mb-0.5">Project</p>
                        <p class="text-purple-300 text-sm font-medium truncate">{{ selectedSub.projectName }}</p>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- SECTION: Line Items -->
              <div class="rounded-xl border border-white/8 overflow-hidden" style="background: rgba(255,255,255,0.02);">
                <div class="px-5 py-3 border-b border-white/5 flex items-center justify-between"
                  style="background: rgba(168,85,247,0.06);">
                  <div class="flex items-center gap-2">
                    <span class="text-purple-400">📋</span>
                    <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider">Line Items</h3>
                  </div>
                  <div class="flex items-center gap-2">
                    <!-- Smart Estimate button -->
                    <button
                      v-if="form.submissionId"
                      @click="generateEstimate"
                      :disabled="estimating"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style="background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(219,39,119,0.2)); border: 1px solid rgba(168,85,247,0.4); color: #c084fc;"
                    >
                      <svg v-if="estimating" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <span v-else>🧮</span>
                      {{ estimating ? 'Estimating…' : 'Smart Estimate' }}
                    </button>
                    <span class="text-xs text-white/30">{{ items.length }} item{{ items.length !== 1 ? 's' : '' }}</span>
                  </div>
                </div>

                <!-- Auto-generated banner -->
                <Transition name="fade-slide">
                  <div v-if="isAutoGenerated"
                    class="mx-5 mt-4 px-4 py-2.5 rounded-lg flex items-center gap-3 text-xs"
                    style="background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(34,211,238,0.08)); border: 1px solid rgba(168,85,247,0.25);"
                  >
                    <span class="text-lg">✨</span>
                    <div>
                      <span class="text-purple-300 font-semibold">AI-generated estimate</span>
                      <span class="text-white/50 ml-1">— review and adjust each line item below before saving.</span>
                    </div>
                    <button @click="isAutoGenerated = false" class="ml-auto text-white/30 hover:text-white/60 text-base leading-none">×</button>
                  </div>
                </Transition>

                <div class="p-5">
                  <!-- Column headers -->
                  <div class="grid gap-2 mb-2 px-1" style="grid-template-columns: 1fr 70px 110px 100px 32px;">
                    <span class="text-xs text-white/30 uppercase tracking-wider">Description</span>
                    <span class="text-xs text-white/30 uppercase tracking-wider text-center">Qty</span>
                    <span class="text-xs text-white/30 uppercase tracking-wider text-right">Unit Price</span>
                    <span class="text-xs text-white/30 uppercase tracking-wider text-right">Total</span>
                    <span />
                  </div>

                  <!-- Item rows -->
                  <TransitionGroup name="item-list" tag="div" class="space-y-2">
                    <div
                      v-for="(item, i) in items"
                      :key="item._key"
                      class="grid gap-2 items-center group"
                      style="grid-template-columns: 1fr 70px 110px 100px 32px;"
                    >
                      <input
                        v-model="item.description"
                        placeholder="Service description…"
                        class="px-3 py-2 rounded-lg text-white text-sm placeholder-white/20 outline-none transition-all duration-200"
                        :style="neuInput"
                        @focus="(e) => (e.target as HTMLElement).style.cssText += '; box-shadow: inset 1px 1px 6px rgba(0,0,0,0.4), 0 0 0 2px rgba(168,85,247,0.4);'"
                        @blur="(e) => ((e.target as HTMLElement).style.cssText = neuInputStr)"
                      />
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        class="px-3 py-2 rounded-lg text-white text-sm text-center outline-none transition-all duration-200"
                        :style="neuInput"
                        @input="updateItemTotal(item)"
                      />
                      <input
                        v-model.number="item.unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="px-3 py-2 rounded-lg text-white text-sm text-right outline-none transition-all duration-200"
                        :style="neuInput"
                        @input="updateItemTotal(item)"
                      />
                      <div
                        class="px-3 py-2 rounded-lg text-right text-sm font-semibold text-purple-300"
                        style="background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.15);"
                      >
                        {{ formatAmount(item.total) }}
                      </div>
                      <button
                        @click="removeItem(i)"
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </TransitionGroup>

                  <!-- Add item button -->
                  <button
                    @click="addItem"
                    class="mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-purple-400 hover:text-purple-300 transition-all duration-200 flex items-center justify-center gap-2 group"
                    style="border: 1px dashed rgba(168,85,247,0.3); background: rgba(168,85,247,0.03);"
                    @mouseenter="(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.6)'"
                    @mouseleave="(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.3)'"
                  >
                    <span class="text-lg leading-none group-hover:scale-125 transition-transform">+</span>
                    Add Line Item
                  </button>
                </div>
              </div>

              <!-- SECTION: Pricing -->
              <div class="rounded-xl border border-white/8 overflow-hidden" style="background: rgba(255,255,255,0.02);">
                <div class="px-5 py-3 border-b border-white/5 flex items-center gap-2"
                  style="background: rgba(168,85,247,0.06);">
                  <span class="text-purple-400">💰</span>
                  <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider">Pricing</h3>
                </div>
                <div class="p-5 space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <!-- Currency -->
                    <div>
                      <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Currency</label>
                      <div class="relative">
                        <select
                          v-model="form.currency"
                          class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 appearance-none pr-10"
                          :style="neuInput"
                        >
                          <option value="USD" class="bg-gray-900">USD — US Dollar ($)</option>
                          <option value="EUR" class="bg-gray-900">EUR — Euro (€)</option>
                          <option value="GBP" class="bg-gray-900">GBP — British Pound (£)</option>
                          <option value="GHS" class="bg-gray-900">GHS — Ghana Cedi (₵)</option>
                          <option value="CAD" class="bg-gray-900">CAD — Canadian Dollar (C$)</option>
                          <option value="AUD" class="bg-gray-900">AUD — Australian Dollar (A$)</option>
                        </select>
                        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">▾</div>
                      </div>
                    </div>
                    <!-- Tax Rate -->
                    <div>
                      <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Tax Rate (%)</label>
                      <input
                        v-model.number="form.taxRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        placeholder="0"
                        class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
                        :style="neuInput"
                      />
                    </div>
                  </div>

                  <!-- Totals summary -->
                  <div class="rounded-xl p-4 space-y-2 border border-white/5" style="background: rgba(0,0,0,0.2);">
                    <div class="flex justify-between text-sm">
                      <span class="text-white/50">Subtotal</span>
                      <span class="text-white">{{ formatCurrency(subtotal) }}</span>
                    </div>
                    <div v-if="form.taxRate > 0" class="flex justify-between text-sm">
                      <span class="text-white/50">Tax ({{ form.taxRate }}%)</span>
                      <span class="text-white">{{ formatCurrency(taxAmount) }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-purple-500/20">
                      <span class="text-white font-bold">TOTAL</span>
                      <span
                        class="text-2xl font-black text-purple-300 tabular-nums"
                        style="text-shadow: 0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.3);"
                      >{{ formatCurrency(total) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION: Invoice Details -->
              <div class="rounded-xl border border-white/8 overflow-hidden" style="background: rgba(255,255,255,0.02);">
                <div class="px-5 py-3 border-b border-white/5 flex items-center gap-2"
                  style="background: rgba(168,85,247,0.06);">
                  <span class="text-purple-400">📅</span>
                  <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider">Invoice Details</h3>
                </div>
                <div class="p-5 space-y-4">
                  <!-- Due Date -->
                  <div>
                    <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Due Date</label>
                    <!-- Quick presets -->
                    <div class="flex gap-2 mb-2 flex-wrap">
                      <button
                        v-for="preset in dueDatePresets"
                        :key="preset.days"
                        @click="setDueDate(preset.days)"
                        :class="[
                          'px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 border',
                          isDueDatePreset(preset.days)
                            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                            : 'border-white/10 bg-white/5 text-white/50 hover:border-purple-500/40 hover:text-white/80'
                        ]"
                      >
                        {{ preset.label }}
                      </button>
                    </div>
                    <input
                      v-model="form.dueDate"
                      type="date"
                      class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200"
                      :style="neuInput"
                      :min="todayISO"
                    />
                  </div>

                  <!-- Payment terms -->
                  <div>
                    <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Payment Terms</label>
                    <div class="relative">
                      <select
                        v-model="form.paymentTerms"
                        class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 appearance-none pr-10"
                        :style="neuInput"
                      >
                        <option value="IMMEDIATE" class="bg-gray-900">Due Immediately</option>
                        <option value="NET_7" class="bg-gray-900">Net 7 Days</option>
                        <option value="NET_14" class="bg-gray-900">Net 14 Days</option>
                        <option value="NET_30" class="bg-gray-900">Net 30 Days</option>
                        <option value="NET_60" class="bg-gray-900">Net 60 Days</option>
                      </select>
                      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">▾</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION: Notes & Terms -->
              <div class="rounded-xl border border-white/8 overflow-hidden" style="background: rgba(255,255,255,0.02);">
                <div class="px-5 py-3 border-b border-white/5 flex items-center gap-2"
                  style="background: rgba(168,85,247,0.06);">
                  <span class="text-purple-400">📝</span>
                  <h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider">Notes & Terms</h3>
                </div>
                <div class="p-5">
                  <textarea
                    v-model="form.notes"
                    rows="4"
                    placeholder="Payment instructions, special terms, or additional notes for the client…"
                    class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/20 outline-none transition-all duration-200 resize-none"
                    :style="neuInput"
                  />
                </div>
              </div>
            </div>

            <!-- ── RIGHT: LIVE PREVIEW ── -->
            <div
              class="hidden lg:flex lg:w-[48%] border-l border-white/8 overflow-y-auto flex-col bg-black/10 p-5"
              style="scrollbar-width: thin; scrollbar-color: rgba(168,85,247,0.2) transparent;"
            >
              <!-- Preview label -->
              <div class="flex items-center gap-2 mb-4">
                <div class="h-px flex-1 bg-white/5" />
                <span class="text-xs text-white/25 uppercase tracking-widest">Live Preview</span>
                <div class="h-px flex-1 bg-white/5" />
              </div>

              <!-- Invoice document -->
              <div
                class="rounded-2xl overflow-hidden border border-white/8 flex-1"
                style="background: rgba(20,12,45,0.8);"
              >
                <!-- Invoice header band -->
                <div
                  class="px-8 py-6"
                  style="background: linear-gradient(135deg, rgba(88,28,135,0.9) 0%, rgba(126,34,206,0.7) 50%, rgba(190,24,93,0.5) 100%);"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="text-3xl font-black tracking-tighter text-white mb-0.5">CHARATECH</div>
                      <div class="text-purple-300/60 text-xs tracking-widest uppercase">Software Requirements Platform</div>
                    </div>
                    <div class="text-right">
                      <div class="text-white/40 text-[10px] uppercase tracking-widest mb-1">Invoice</div>
                      <div class="text-white font-bold text-lg tabular-nums">{{ previewInvoiceNumber }}</div>
                    </div>
                  </div>
                </div>

                <!-- Meta strip: date, due, currency -->
                <div class="grid grid-cols-3 border-b border-white/5 bg-purple-900/10">
                  <div class="px-5 py-3 border-r border-white/5">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Issue Date</p>
                    <p class="text-white text-sm font-medium">{{ todayDisplay }}</p>
                  </div>
                  <div class="px-5 py-3 border-r border-white/5">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Due Date</p>
                    <p class="text-white text-sm font-medium">{{ dueDateDisplay }}</p>
                  </div>
                  <div class="px-5 py-3">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Currency</p>
                    <p class="text-white text-sm font-medium">{{ form.currency }}</p>
                  </div>
                </div>

                <!-- From / Bill To -->
                <div class="grid grid-cols-2 gap-0 border-b border-white/5">
                  <div class="px-6 py-5 border-r border-white/5">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-2">From</p>
                    <p class="text-white font-bold text-sm">CharaTech Ltd.</p>
                    <p class="text-white/50 text-xs mt-0.5">info@charatech.com</p>
                    <p class="text-white/50 text-xs">chara-tech-web.vercel.app</p>
                  </div>
                  <div class="px-6 py-5">
                    <p class="text-white/30 text-[10px] uppercase tracking-widest mb-2">Bill To</p>
                    <p class="text-white font-bold text-sm">
                      {{ selectedSub?.user?.fullName || selectedSub?.user?.email || '— client —' }}
                    </p>
                    <p class="text-white/50 text-xs mt-0.5">{{ selectedSub?.user?.email || '' }}</p>
                    <p class="text-white/50 text-xs">{{ selectedSub?.user?.companyName || '' }}</p>
                  </div>
                </div>

                <!-- Project reference -->
                <div v-if="selectedSub" class="px-6 py-3 border-b border-white/5 bg-purple-900/10 flex items-center gap-3">
                  <span class="text-white/30 text-[10px] uppercase tracking-widest">Project:</span>
                  <span class="text-purple-300 text-sm font-medium">{{ selectedSub.projectName }}</span>
                </div>

                <!-- Line items table -->
                <div class="px-6 pt-5 pb-3">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="border-b border-white/8">
                        <th class="text-left text-white/30 uppercase tracking-wider pb-2 font-medium">Description</th>
                        <th class="text-center text-white/30 uppercase tracking-wider pb-2 font-medium w-12">Qty</th>
                        <th class="text-right text-white/30 uppercase tracking-wider pb-2 font-medium w-24">Price</th>
                        <th class="text-right text-white/30 uppercase tracking-wider pb-2 font-medium w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="!items.length">
                        <td colspan="4" class="py-6 text-center text-white/15 italic">
                          Add items to see them here
                        </td>
                      </tr>
                      <tr
                        v-for="(item, i) in items"
                        :key="item._key"
                        :class="['border-b border-white/5', i % 2 === 0 ? '' : 'bg-white/[0.01]']"
                      >
                        <td class="py-2.5 text-white/80 pr-3">{{ item.description || 'Service item…' }}</td>
                        <td class="py-2.5 text-center text-white/50">{{ item.quantity }}</td>
                        <td class="py-2.5 text-right text-white/50 tabular-nums">{{ formatCurrency(item.unitPrice) }}</td>
                        <td class="py-2.5 text-right text-white font-semibold tabular-nums">{{ formatCurrency(item.total) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Totals block -->
                <div class="px-6 pb-5 flex justify-end">
                  <div class="w-56 space-y-1.5">
                    <div class="flex justify-between text-xs text-white/50">
                      <span>Subtotal</span>
                      <span class="tabular-nums">{{ formatCurrency(subtotal) }}</span>
                    </div>
                    <div v-if="form.taxRate > 0" class="flex justify-between text-xs text-white/50">
                      <span>Tax ({{ form.taxRate }}%)</span>
                      <span class="tabular-nums">{{ formatCurrency(taxAmount) }}</span>
                    </div>
                    <div class="flex justify-between items-baseline pt-2 border-t border-purple-500/25">
                      <span class="text-white font-bold text-sm">Total Due</span>
                      <span
                        class="text-xl font-black text-purple-300 tabular-nums"
                        style="text-shadow: 0 0 16px rgba(168,85,247,0.9), 0 0 32px rgba(168,85,247,0.4);"
                      >{{ formatCurrency(total) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="form.notes" class="px-6 py-4 border-t border-white/5">
                  <p class="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Notes</p>
                  <p class="text-white/60 text-xs whitespace-pre-wrap leading-relaxed">{{ form.notes }}</p>
                </div>

                <!-- Payment terms badge -->
                <div v-if="form.paymentTerms" class="px-6 py-3 border-t border-white/5 flex items-center gap-2">
                  <span class="text-white/25 text-[10px] uppercase tracking-widest">Terms:</span>
                  <span class="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300/70 text-xs">
                    {{ paymentTermsLabel }}
                  </span>
                </div>

                <!-- Footer -->
                <div
                  class="px-6 py-3 text-center border-t border-white/5"
                  style="background: linear-gradient(90deg, rgba(88,28,135,0.15) 0%, rgba(190,24,93,0.1) 100%);"
                >
                  <p class="text-white/25 text-[10px] tracking-widest uppercase">Thank you for choosing CharaTech · info@charatech.com</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ FOOTER ACTIONS ═══ -->
          <div
            class="flex-shrink-0 border-t border-white/8 px-8 py-4 flex items-center justify-between gap-4"
            style="background: rgba(0,0,0,0.35);"
          >
            <!-- Status / error -->
            <div>
              <Transition name="fade-slide">
                <p v-if="formError" class="text-red-400 text-sm flex items-center gap-2">
                  <span>⚠</span> {{ formError }}
                </p>
                <p v-else class="text-white/30 text-xs tabular-nums">
                  {{ items.length }} item{{ items.length !== 1 ? 's' : '' }} · Total {{ formatCurrency(total) }}
                </p>
              </Transition>
            </div>

            <!-- Buttons -->
            <div class="flex items-center gap-3">
              <button
                @click="close"
                class="px-5 py-2.5 rounded-xl text-white/60 hover:text-white text-sm font-medium transition border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                Cancel
              </button>

              <!-- Save as Draft -->
              <button
                @click="submitInvoice('DRAFT')"
                :disabled="loading"
                class="relative px-6 py-2.5 rounded-xl text-sm font-semibold text-white/90 transition-all duration-200 border border-white/15 overflow-hidden"
                style="background: rgba(255,255,255,0.06);"
              >
                <span v-if="loading && activeSubmitStatus === 'DRAFT'" class="flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving…
                </span>
                <span v-else>Save as Draft</span>
              </button>

              <!-- Create & Send -->
              <button
                @click="submitInvoice('SENT')"
                :disabled="loading"
                class="relative px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: linear-gradient(135deg, #7c3aed, #db2777); box-shadow: 0 0 20px rgba(168,85,247,0.3);"
                @mouseenter="(e) => !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(168,85,247,0.5)')"
                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(168,85,247,0.3)')"
              >
                <span v-if="loading && activeSubmitStatus === 'SENT'" class="flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Sending…
                </span>
                <span v-else class="flex items-center gap-2">Create &amp; Send <span>→</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

interface LineItem {
  _key: number
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Props {
  show: boolean
  submissions: any[]
  preselectedSubmission?: any
  preGeneratedItems?: { description: string; quantity: number; unitPrice: number; total: number; category?: string }[]
  preGeneratedTaxRate?: number
  preGeneratedNotes?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  created: [invoice: any]
}>()

const { getAccessToken } = useAuth()

// ── State ──────────────────────────────────────────────────
let _keyCounter = 0
const loading = ref(false)
const estimating = ref(false)
const isAutoGenerated = ref(false)
const formError = ref('')
const activeSubmitStatus = ref<'DRAFT' | 'SENT' | null>(null)

const form = reactive({
  submissionId: '',
  currency: 'USD',
  taxRate: 0,
  dueDate: '',
  paymentTerms: 'NET_30',
  notes: '',
})

const items = ref<LineItem[]>([
  { _key: ++_keyCounter, description: '', quantity: 1, unitPrice: 0, total: 0 },
])

// ── Watchers ───────────────────────────────────────────────
watch(() => props.preselectedSubmission, (sub) => {
  if (sub) form.submissionId = sub.id
}, { immediate: true })

watch(() => props.show, (val) => {
  if (val) {
    formError.value = ''
    if (props.preselectedSubmission) form.submissionId = props.preselectedSubmission.id
    setDueDate(30)
  }
})

watch(() => props.preGeneratedItems, (generated) => {
  if (generated?.length) {
    applyGeneratedItems(generated, props.preGeneratedTaxRate, props.preGeneratedNotes)
  }
}, { deep: true, immediate: true })

// ── Computed ───────────────────────────────────────────────
const selectedSub = computed(() =>
  props.submissions.find((s) => s.id === form.submissionId) ?? null
)

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + (item.total || 0), 0)
)
const taxAmount = computed(() => subtotal.value * ((form.taxRate || 0) / 100))
const total = computed(() => subtotal.value + taxAmount.value)

const todayISO = computed(() => new Date().toISOString().split('T')[0])
const todayDisplay = computed(() =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
)
const dueDateDisplay = computed(() =>
  form.dueDate
    ? new Date(form.dueDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—'
)
const previewInvoiceNumber = computed(() => {
  const y = new Date().getFullYear()
  return `INV-${y}-XXXXX`
})
const paymentTermsLabel = computed(() => {
  const map: Record<string, string> = {
    IMMEDIATE: 'Due Immediately',
    NET_7: 'Net 7 Days',
    NET_14: 'Net 14 Days',
    NET_30: 'Net 30 Days',
    NET_60: 'Net 60 Days',
  }
  return map[form.paymentTerms] || form.paymentTerms
})

// ── Neumorphism style ───────────────────────────────────────
const neuInputStr = 'background: rgba(0,0,0,0.25); box-shadow: inset 2px 2px 8px rgba(0,0,0,0.5), inset -1px -1px 4px rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);'
const neuInput = neuInputStr

// ── Due date presets ────────────────────────────────────────
const dueDatePresets = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
]

const setDueDate = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  form.dueDate = d.toISOString().split('T')[0]
}

const isDueDatePreset = (days: number) => {
  if (!form.dueDate) return false
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0] === form.dueDate
}

// ── Auto-generate helpers ───────────────────────────────────
const applyGeneratedItems = (
  generated: { description: string; quantity: number; unitPrice: number; total: number; category?: string }[],
  taxRate?: number,
  notes?: string
) => {
  items.value = generated.map((item) => ({
    _key: ++_keyCounter,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }))
  if (taxRate !== undefined) form.taxRate = Math.round(taxRate * 100)
  if (notes) form.notes = notes
  isAutoGenerated.value = true
}

const generateEstimate = async () => {
  if (!form.submissionId) { formError.value = 'Select a submission first.'; return }
  estimating.value = true
  formError.value = ''
  try {
    const token = await getAccessToken()
    const result = await $fetch<{ success: boolean; pricing: any }>('/api/admin/invoices/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { submissionId: form.submissionId, currency: form.currency },
    })
    if (result.pricing?.items) {
      applyGeneratedItems(result.pricing.items, result.pricing.suggestedTaxRate, result.pricing.notes)
    }
  } catch (err: any) {
    formError.value = err?.data?.message || 'Failed to generate estimate.'
  } finally {
    estimating.value = false
  }
}

// ── Line item helpers ───────────────────────────────────────
const addItem = () => {
  items.value.push({ _key: ++_keyCounter, description: '', quantity: 1, unitPrice: 0, total: 0 })
}
const removeItem = (index: number) => {
  if (items.value.length > 1) items.value.splice(index, 1)
}
const updateItemTotal = (item: LineItem) => {
  item.total = (item.quantity || 0) * (item.unitPrice || 0)
}

// ── Progress step ───────────────────────────────────────────
const isStepComplete = (step: number) => {
  if (step === 0) return !!form.submissionId
  if (step === 1) return items.value.length > 0 && items.value.some((i) => i.description)
  if (step === 2) return subtotal.value > 0
  if (step === 3) return !!form.dueDate
  return false
}

// ── Formatting ──────────────────────────────────────────────
const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', GHS: '₵', CAD: 'C$', AUD: 'A$',
}
const formatCurrency = (amount: number) => {
  const sym = currencySymbols[form.currency] || '$'
  return `${sym}${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}
const formatAmount = (amount: number) => formatCurrency(amount)

// ── Validation ──────────────────────────────────────────────
const validate = () => {
  if (!form.submissionId) return 'Please select a submission.'
  if (!items.value.length) return 'Please add at least one line item.'
  if (items.value.some((i) => !i.description.trim())) return 'Please fill in all item descriptions.'
  if (items.value.some((i) => i.quantity < 1)) return 'Quantity must be at least 1 for all items.'
  if (subtotal.value <= 0) return 'Invoice total must be greater than zero.'
  return null
}

// ── Submit ──────────────────────────────────────────────────
const submitInvoice = async (status: 'DRAFT' | 'SENT') => {
  const err = validate()
  if (err) { formError.value = err; return }
  formError.value = ''

  loading.value = true
  activeSubmitStatus.value = status

  try {
    const token = await getAccessToken()
    const sub = selectedSub.value!

    const payload = {
      submissionId: form.submissionId,
      clientId: sub.userId,
      amount: subtotal.value,
      taxAmount: taxAmount.value,
      currency: form.currency,
      items: items.value.map(({ description, quantity, unitPrice, total }) => ({
        description, quantity, unitPrice, total,
      })),
      notes: form.notes || null,
      dueDate: form.dueDate || null,
      status,
    }

    const result = await $fetch<{ success: boolean; invoice: any }>('/api/admin/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    })

    emit('created', result.invoice)
    close()
  } catch (err: any) {
    formError.value = err?.data?.message || err.message || 'Failed to create invoice.'
  } finally {
    loading.value = false
    activeSubmitStatus.value = null
  }
}

// ── Close / reset ───────────────────────────────────────────
const close = () => {
  if (loading.value) return
  emit('close')
  setTimeout(() => {
    form.submissionId = ''
    form.currency = 'USD'
    form.taxRate = 0
    form.dueDate = ''
    form.paymentTerms = 'NET_30'
    form.notes = ''
    items.value = [{ _key: ++_keyCounter, description: '', quantity: 1, unitPrice: 0, total: 0 }]
    formError.value = ''
    isAutoGenerated.value = false
  }, 300)
}
</script>

<style scoped>
/* Modal enter/leave */
.modal-enter-active {
  animation: modal-in 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.modal-leave-active {
  animation: modal-in 0.2s ease-in reverse;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.94) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* Fade slide for inline messages */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Item list transition */
.item-list-enter-active,
.item-list-leave-active {
  transition: all 0.2s ease;
}
.item-list-enter-from,
.item-list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* Scrollbar styling */
:deep(::-webkit-scrollbar) {
  width: 4px;
}
:deep(::-webkit-scrollbar-track) {
  background: transparent;
}
:deep(::-webkit-scrollbar-thumb) {
  background: rgba(168, 85, 247, 0.2);
  border-radius: 2px;
}

/* Date input color fix */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.5) sepia(1) saturate(5) hue-rotate(200deg);
  cursor: pointer;
}
</style>
