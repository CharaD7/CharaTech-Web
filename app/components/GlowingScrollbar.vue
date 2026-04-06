<template>
  <div 
    class="glowing-scrollbar" 
    :style="maxHeight ? { maxHeight } : undefined"
    :class="className"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  maxHeight?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: undefined,
  className: ''
})
</script>

<style scoped>
.glowing-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.5) rgba(255, 255, 255, 0.05);
}

.glowing-scrollbar[style*="max-height"] {
  overflow-y: auto;
}

.glowing-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.glowing-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.glowing-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #9333ea, #ec4899);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3);
  transition: all 0.2s ease;
}

.glowing-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a855f7, #f472b6);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.7), 0 0 30px rgba(168, 85, 247, 0.4);
}
</style>
