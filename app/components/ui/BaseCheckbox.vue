<template>
  <div class="w-full">
    <label v-if="label" :for="checkboxId" class="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        :id="checkboxId"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        class="w-5 h-5 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span class="text-white">{{ label }}</span>
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

const checkboxId = `checkbox-${Math.random().toString(36).slice(2, 9)}`
</script>
