<template>
  <div
    v-if="modelValue"
    :class="[
      'px-4 py-3 rounded-lg backdrop-blur-sm',
      variantClasses
    ]"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <svg v-if="variant === 'danger'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="variant === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="flex-1">
        <p v-if="title" class="font-medium text-white mb-1">{{ title }}</p>
        <p class="text-white text-sm">
          <slot>{{ message }}</slot>
        </p>
      </div>
      <button
        v-if="dismissible"
        @click="$emit('update:modelValue', false)"
        class="flex-shrink-0 text-white/60 hover:text-white transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  variant?: 'info' | 'warning' | 'danger'
  title?: string
  message?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const variantClasses = computed(() => ({
  info: 'bg-purple-500/20 border border-purple-400/50',
  warning: 'bg-yellow-500/20 border border-yellow-400/50',
  danger: 'bg-red-500/20 border border-red-400/50'
}[props.variant]))
</script>
