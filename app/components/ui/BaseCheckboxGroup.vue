<template>
  <div class="w-full">
    <label v-if="label" :for="checkboxId" class="block text-sm font-medium text-white mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <GlowingScrollbar
      maxHeight="320px"
      className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/20"
    >
      <div
        v-for="option in extendedOptions"
        :key="option.value"
        class="relative"
      >
        <label
          class="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2.5 rounded-lg transition group"
          @mouseenter="onHover(option)"
          @mouseleave="onLeave"
        >
          <input
            type="checkbox"
            :checked="modelValue.includes(option.value)"
            :value="option.value"
            :disabled="disabled"
            class="w-5 h-5 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer flex-shrink-0"
            @change="handleToggle(option)"
          />
          <span class="text-white text-sm flex-1">{{ option.label }}</span>
          <span
            v-if="option.description"
            class="text-white/30 hover:text-purple-400 transition shrink-0"
            @click.stop="openPopup(option)"
            title="Learn more"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </label>

        <!-- Tooltip -->
        <Teleport to="body">
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="tooltip.visible && tooltip.value === option.value"
              :style="tooltip.style"
              class="fixed z-[9999] px-3 py-2 bg-gray-800/95 backdrop-blur-md border border-white/15 rounded-lg shadow-xl shadow-purple-900/20 text-xs text-white/80 max-w-xs leading-relaxed pointer-events-none"
            >
              {{ option.description }}
            </div>
          </transition>
        </Teleport>
      </div>
    </GlowingScrollbar>

    <!-- Feature popup -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="popup.option"
          ref="popupRef"
          :style="popup.style"
          class="fixed z-[9999] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-purple-900/30 p-4 min-w-[220px] max-w-xs"
          @click.stop
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-white">{{ popup.option.label }}</h4>
            <button
              type="button"
              class="text-white/30 hover:text-white/70 transition"
              @click="closePopup"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="popup.option.description" class="text-xs text-white/50 mb-3 leading-relaxed">{{ popup.option.description }}</p>
          <div class="space-y-2">
            <label
              v-for="feature in popup.option.features || []"
              :key="feature.value"
              class="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                :checked="isFeatureSelected(popup.option.value, feature.value)"
                class="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer flex-shrink-0"
                @change="toggleFeature(popup.option.value, feature.value)"
              />
              <span class="text-white/70 text-xs group-hover:text-white transition">{{ feature.label }}</span>
            </label>
          </div>
        </div>
      </transition>
    </Teleport>

    <p v-if="hint" class="text-xs text-white/60 mt-1">{{ hint }}</p>
    <p v-if="error" class="text-xs text-red-300 mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  value: string
  label: string
}

interface ExtendedOption {
  value: string
  label: string
  description?: string
  features?: Feature[]
}

interface Props {
  modelValue: string[]
  options: ExtendedOption[]
  modelFeatures?: Record<string, string[]>
  label?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  modelValue: () => [],
  options: () => [],
  modelFeatures: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'update:modelFeatures': [value: Record<string, string[]>]
}>()

const checkboxId = `checkbox-group-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`

const extendedOptions = computed<ExtendedOption[]>(() => props.options as ExtendedOption[])

const tooltip = reactive<{ visible: boolean; value: string; style: Record<string, string> }>({
  visible: false,
  value: '',
  style: {},
})

const popup = reactive<{
  option: ExtendedOption | null
  style: Record<string, string>
}>({
  option: null,
  style: {},
})

const popupRef = ref<HTMLElement | null>(null)
let tooltipTimer: ReturnType<typeof setTimeout> | null = null

function onHover(option: ExtendedOption) {
  if (!option.description) return
  if (tooltipTimer) clearTimeout(tooltipTimer)
  tooltipTimer = setTimeout(() => {
    const el = document.activeElement?.closest('.container')
    const label = document.querySelector(`label:has(input[value="${option.value}"])`)
    if (label) {
      const rect = label.getBoundingClientRect()
      tooltip.style = {
        top: `${rect.top - 8}px`,
        left: `${rect.right + 12}px`,
        transform: 'translateY(-100%)',
      }
      tooltip.value = option.value
      tooltip.visible = true
    }
  }, 400)
}

function onLeave() {
  if (tooltipTimer) clearTimeout(tooltipTimer)
  tooltip.visible = false
}

function handleToggle(option: ExtendedOption) {
  const value = option.value
  const newValue = props.modelValue.includes(value)
    ? props.modelValue.filter(v => v !== value)
    : [...props.modelValue, value]
  emit('update:modelValue', newValue)
}

function openPopup(option: ExtendedOption) {
  if (!option.features || option.features.length === 0) return
  popup.option = option

  nextTick(() => {
    if (!popupRef.value) return
    const rect = popupRef.value.getBoundingClientRect()
    const icon = document.activeElement || document.querySelector(`input[value="${option.value}"]`)
    if (icon) {
      const iconRect = icon.getBoundingClientRect()
      let top = iconRect.bottom + 8
      let left = iconRect.left

      // Flip if off-screen bottom
      if (top + rect.height > window.innerHeight) {
        top = iconRect.top - rect.height - 8
      }
      // Keep within viewport horizontally
      if (left + rect.width > window.innerWidth) {
        left = window.innerWidth - rect.width - 16
      }
      if (left < 16) left = 16

      popup.style = { top: `${top}px`, left: `${left}px` }
    }
  })
}

function closePopup() {
  popup.option = null
}

function isFeatureSelected(optionValue: string, featureValue: string): boolean {
  return (props.modelFeatures[optionValue] || []).includes(featureValue)
}

function toggleFeature(optionValue: string, featureValue: string) {
  const current = props.modelFeatures[optionValue] || []
  const updated = current.includes(featureValue)
    ? current.filter(v => v !== featureValue)
    : [...current, featureValue]
  emit('update:modelFeatures', { ...props.modelFeatures, [optionValue]: updated })
}

function onClickOutside(e: MouseEvent) {
  if (!popup.option) return
  const target = e.target as HTMLElement
  if (popupRef.value?.contains(target)) return
  closePopup()
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>
