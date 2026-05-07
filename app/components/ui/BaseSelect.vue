<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-white mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative group" ref="containerRef">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200" :class="{ '!opacity-50': open }"></div>
      <div class="relative">
        <button
          type="button"
          :id="selectId"
          :disabled="disabled"
          :class="[
            'w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border rounded-lg text-white text-left appearance-none outline-none transition-all duration-300 cursor-pointer flex items-center justify-between gap-2',
            { 'cursor-not-allowed opacity-50': disabled },
            { 'border-purple-400 shadow-lg shadow-purple-500/20 bg-gray-800/90': open },
            { 'hover:border-white/30 border-white/20': !open && !disabled },
            selectClass
          ]"
          @click="toggle"
          @keydown.down.prevent="open ? focusNext() : openDropdown()"
          @keydown.up.prevent="focusPrev()"
          @keydown.enter.prevent="selectFocused"
          @keydown.escape.prevent="close"
        >
          <span :class="{ 'text-white/40': !selectedLabel }">{{ selectedLabel || placeholder || 'Select...' }}</span>
          <svg class="w-5 h-5 text-white/40 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

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
            v-if="open"
            ref="dropdownRef"
            :style="dropdownStyle"
            class="fixed z-[9999] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-purple-900/30 overflow-hidden"
            @click.stop
          >
            <div class="max-h-60 overflow-y-auto py-2 scrollbar-thin">
              <button
                v-for="(option, index) in normalizedOptions"
                :key="option.value"
                ref="optionRefs"
                type="button"
                :class="[
                  'w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center justify-between gap-3',
                  modelValue === option.value
                    ? 'text-purple-300 bg-purple-500/15 font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/5',
                  { 'bg-white/5': focusedIndex === index && modelValue !== option.value }
                ]"
                @click="select(option.value)"
                @mouseenter="focusedIndex = index"
              >
                <span>{{ option.label }}</span>
                <svg v-if="modelValue === option.value" class="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </transition>
      </Teleport>
    </div>
    <p v-if="error" class="text-xs text-red-300 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-white/60 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string
  label: string
}

type OptionInput = string | Option

interface Props {
  modelValue?: string
  options?: OptionInput[]
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  selectClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: '',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const selectId = `select-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`

const open = ref(false)
const focusedIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const optionRefs = ref<HTMLElement[]>([])
const dropdownStyle = ref<Record<string, string>>({})

const normalizedOptions = computed<Option[]>(() =>
  props.options.map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt)
)

const selectedLabel = computed(() => {
  const opt = normalizedOptions.value.find(o => o.value === props.modelValue)
  return opt ? opt.label : null
})

function positionDropdown() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

function openDropdown() {
  if (props.disabled) return
  open.value = true
  focusedIndex.value = Math.max(0, normalizedOptions.value.findIndex(o => o.value === props.modelValue))
  positionDropdown()
  emit('focus', new FocusEvent('focus'))
}

function close() {
  open.value = false
  focusedIndex.value = -1
}

function toggle() {
  open.value ? close() : openDropdown()
}

function select(value: string) {
  emit('update:modelValue', value)
  close()
}

function focusNext() {
  if (focusedIndex.value < normalizedOptions.value.length - 1) {
    focusedIndex.value++
    scrollIntoView()
  }
}

function focusPrev() {
  if (focusedIndex.value > 0) {
    focusedIndex.value--
    scrollIntoView()
  }
}

function selectFocused() {
  if (focusedIndex.value >= 0 && focusedIndex.value < normalizedOptions.value.length) {
    select(normalizedOptions.value[focusedIndex.value].value)
  }
}

function scrollIntoView() {
  nextTick(() => {
    const el = optionRefs.value[focusedIndex.value]
    if (el) el.scrollIntoView({ block: 'nearest' })
  })
}

function onClickOutside(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as HTMLElement
  if (containerRef.value?.contains(target) || dropdownRef.value?.contains(target)) return
  close()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('scroll', positionDropdown, true)
  window.addEventListener('resize', positionDropdown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('scroll', positionDropdown, true)
  window.removeEventListener('resize', positionDropdown)
})
</script>
