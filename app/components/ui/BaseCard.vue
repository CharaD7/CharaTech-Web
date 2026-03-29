<template>
  <div :class="['glass-morphism p-6 rounded-xl', customClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

const props = defineProps<Props>()
const customClass = computed(() => props.class || '')
</script>
