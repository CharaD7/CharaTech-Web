<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
      sizeClasses,
      variantClasses,
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
  >
    <span v-if="loading" class="flex items-center justify-center gap-2">
      <BaseSpinner :size="spinnerSize" />
      <slot>{{ loadingText }}</slot>
    </span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  loadingText: 'Loading...'
})

const sizeClasses = computed(() => ({
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg'
}[props.size]))

const spinnerSize = computed(() => ({
  sm: 14,
  md: 16,
  lg: 20
}[props.size]))

const variantClasses = computed(() => ({
  primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-400 shadow-lg',
  secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-purple-400 border border-white/20',
  ghost: 'text-white hover:bg-white/10 focus:ring-purple-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400'
}[props.variant]))
</script>
