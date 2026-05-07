<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 appearance-none pr-10 cursor-pointer',
          { 'cursor-not-allowed opacity-50': disabled },
          selectClass || neuInput
        ]"
        @change="onChange"
        @blur="$emit('blur', $event)"
      >
        <option v-if="placeholder" value="" disabled class="bg-gray-900 text-white/40">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="bg-gray-900 text-white"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">▾</div>
    </div>
    <p v-if="error" class="text-xs text-red-400 mt-1.5">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  selectClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  options: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const selectId = `select-${Math.random().toString(36).slice(2, 9)}`
const neuInput = 'background: rgba(0,0,0,0.25); box-shadow: inset 2px 2px 8px rgba(0,0,0,0.5), inset -1px -1px 4px rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);'

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
