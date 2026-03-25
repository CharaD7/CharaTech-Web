<template>
  <div class="w-full">
    <label v-if="label" :for="checkboxId" class="block text-sm font-medium text-white mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="space-y-2 bg-white/5 p-4 rounded-lg border border-white/20 max-h-64 overflow-y-auto">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(option.value)"
          :value="option.value"
          :disabled="disabled"
          class="w-5 h-5 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
          @change="toggleOption(option.value)"
        />
        <span class="text-white">{{ option.label }}</span>
      </label>
    </div>
    <p v-if="hint" class="text-xs text-white/60 mt-1">{{ hint }}</p>
    <p v-if="error" class="text-xs text-red-300 mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string[]
  options: Option[]
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
  options: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const checkboxId = `checkbox-group-${Math.random().toString(36).slice(2, 9)}`

const toggleOption = (value: string) => {
  const newValue = props.modelValue.includes(value)
    ? props.modelValue.filter(v => v !== value)
    : [...props.modelValue, value]
  emit('update:modelValue', newValue)
}
</script>
