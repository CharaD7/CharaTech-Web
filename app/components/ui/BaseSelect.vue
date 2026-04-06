<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-white mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none bg-no-repeat bg-right pr-10 cursor-pointer',
        { 'cursor-not-allowed opacity-50': disabled },
        selectClass
      ]"
      :style="{
        backgroundImage: `url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')`,
        backgroundSize: '1.5em',
        backgroundPosition: 'right 0.5rem center'
      }"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
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
    <p v-if="error" class="text-xs text-red-300 mt-1">{{ error }}</p>
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

defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const selectId = `select-${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9)}`
</script>
