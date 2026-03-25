<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      sizeClasses,
      variantClasses
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md'
})

const sizeClasses = computed(() => ({
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}[props.size]))

const variantClasses = computed(() => ({
  default: 'bg-white/10 text-white',
  success: 'bg-green-500/20 text-green-300 border border-green-400/30',
  warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30',
  danger: 'bg-red-500/20 text-red-300 border border-red-400/30',
  info: 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
}[props.variant]))
</script>
