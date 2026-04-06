<template>
  <div class="w-full">
    <label v-if="label" :for="checkboxId" class="flex items-center gap-3 cursor-pointer group">
      <div class="relative">
        <input
          type="checkbox"
          :id="checkboxId"
          :checked="modelValue"
          :disabled="disabled"
          :required="required"
          class="peer sr-only"
          @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        />
        <div class="w-5 h-5 bg-gray-800/80 border border-white/30 rounded transition-all duration-200 peer-checked:bg-purple-600 peer-checked:border-purple-400 peer-hover:border-white/50 group-hover:border-white/40"></div>
        <svg class="absolute inset-0 w-5 h-5 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span class="text-white/80 group-hover:text-white transition-colors">{{ label }}</span>
    </label>
    <p v-if="hint" class="text-xs text-white/60 mt-1 ml-8">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
  required?: boolean
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxId = `checkbox-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`
</script>
