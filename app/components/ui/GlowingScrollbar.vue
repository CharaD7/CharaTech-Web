<template>
  <div class="glowing-scrollbar" :class="{ 'scrollbar-thin': thin }">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  thin?: boolean
}

withDefaults(defineProps<Props>(), {
  thin: false,
})
</script>

<style scoped>
.glowing-scrollbar {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.5) rgba(255, 255, 255, 0.1);
}

.glowing-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.glowing-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.glowing-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(168, 85, 247, 0.3) 0%, 
    rgba(168, 85, 247, 0.6) 50%, 
    rgba(236, 72, 153, 0.6) 100%
  );
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 0 10px rgba(168, 85, 247, 0.3),
    0 0 20px rgba(168, 85, 247, 0.2),
    inset 0 0 5px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.glowing-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(168, 85, 247, 0.5) 0%, 
    rgba(168, 85, 247, 0.8) 50%, 
    rgba(236, 72, 153, 0.8) 100%
  );
  box-shadow: 
    0 0 15px rgba(168, 85, 247, 0.5),
    0 0 30px rgba(168, 85, 247, 0.3),
    inset 0 0 5px rgba(255, 255, 255, 0.2);
}

.glowing-scrollbar::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, 
    rgba(168, 85, 247, 0.7) 0%, 
    rgba(236, 72, 153, 0.9) 100%
  );
  box-shadow: 
    0 0 20px rgba(168, 85, 247, 0.6),
    0 0 40px rgba(168, 85, 247, 0.4),
    inset 0 0 8px rgba(255, 255, 255, 0.3);
}

.glowing-scrollbar::-webkit-scrollbar-corner {
  background: transparent;
}

/* Firefox scrollbar styling */
.glowing-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.5) rgba(255, 255, 255, 0.1);
}

/* Thin variant */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  border-radius: 6px;
}

/* Hover glow animation */
@keyframes scrollbar-glow {
  0%, 100% {
    box-shadow: 
      0 0 10px rgba(168, 85, 247, 0.3),
      0 0 20px rgba(168, 85, 247, 0.2);
  }
  50% {
    box-shadow: 
      0 0 15px rgba(168, 85, 247, 0.5),
      0 0 30px rgba(168, 85, 247, 0.3);
  }
}

.glowing-scrollbar:has(::-webkit-scrollbar-thumb:hover)::-webkit-scrollbar-thumb {
  animation: scrollbar-glow 2s ease-in-out infinite;
}
</style>