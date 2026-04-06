<template>
  <div class="w-full">
    <label v-if="label" :for="textareaId" class="block text-sm font-medium text-white mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="[
        'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition resize-none',
        { 'cursor-not-allowed opacity-50': disabled },
        textareaClass
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="$emit('blur', $event)"
    />
    <p v-if="error" class="text-xs text-red-300 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-white/60 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  rows?: number
  textareaClass?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  required: false,
  rows: 4
})

defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const textareaId = `textarea-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`
</script>
