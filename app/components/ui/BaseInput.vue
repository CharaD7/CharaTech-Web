<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-white mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative group">
      <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
      <div class="relative">
        <input
          :id="inputId"
          :type="actualType"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
          :autocomplete="autocomplete"
          :autofocus="autofocus"
          :class="[
            'w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-300',
            { 'pr-10': type === 'password' },
            { 'cursor-not-allowed opacity-50': disabled },
            isFocused ? 'border-purple-400 shadow-lg shadow-purple-500/20 bg-gray-800/90' : 'hover:border-white/30',
            inputClass
          ]"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          @blur="isFocused = false; $emit('blur', $event)"
          @focus="isFocused = true; $emit('focus', $event)"
        />
        <div v-if="!modelValue && !isFocused" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-opacity duration-200" :class="{ 'opacity-0': isFocused }">
          {{ placeholder }}
        </div>
      </div>
      <button
        v-if="type === 'password'"
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors"
      >
        <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      </button>
    </div>
    <p v-if="error" class="text-xs text-red-300 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-white/60 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  autocomplete?: string
  autofocus?: boolean
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
  autocomplete: 'off'
})

defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const showPassword = ref(false)
const isFocused = ref(false)
const inputId = `input-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`

const actualType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>
