<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-white mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative group">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
      <div class="relative">
        <select
          :id="selectId"
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          :class="[
            'w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-lg text-white appearance-none outline-none transition-all duration-300 cursor-pointer pr-10',
            { 'cursor-not-allowed opacity-50': disabled },
            { 'border-purple-400 shadow-lg shadow-purple-500/20 bg-gray-800/90': isFocused },
            { 'hover:border-white/30': !isFocused && !disabled },
            selectClass
          ]"
          @change="onChange"
          @focus="isFocused = true; $emit('focus', $event)"
          @blur="isFocused = false; $emit('blur', $event)"
        >
          <option v-if="placeholder" value="" disabled class="bg-gray-900 text-white/40">{{ placeholder }}</option>
          <option
            v-for="option in normalizedOptions"
            :key="option.value"
            :value="option.value"
            class="bg-gray-900 text-white"
          >
            {{ option.label }}
          </option>
        </select>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none transition-transform duration-200" :class="{ 'rotate-180': isFocused }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
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
const isFocused = ref(false)

const normalizedOptions = computed<Option[]>(() =>
  props.options.map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt)
)

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
