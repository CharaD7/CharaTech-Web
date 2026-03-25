<template>
  <div :class="['glass-morphism p-6 rounded-xl', className]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

defineProps<Props>()
</script>
