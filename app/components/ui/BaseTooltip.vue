<template>
  <div ref="triggerRef" class="inline-flex" @mouseenter="show = true" @mouseleave="show = false" @focusin="show = true" @focusout="show = false">
    <slot />

    <Teleport to="body">
      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="show"
          ref="tooltipRef"
          :style="positionStyle"
          class="fixed z-[99999] px-3 py-1.5 rounded-lg text-xs leading-relaxed pointer-events-none select-none shadow-xl whitespace-nowrap"
          :class="[variantStyles[variant]]"
        >
          {{ text }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
  variant?: 'dark' | 'light'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dark',
})

const show = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const positionStyle = ref<Record<string, string>>({})

const variantStyles: Record<string, string> = {
  dark: 'bg-gray-800/95 backdrop-blur-md border border-white/15 text-white/90',
  light: 'bg-white/95 backdrop-blur-md border border-gray-200 text-gray-800',
}

watch(show, (val) => {
  if (val) nextTick(position)
})

function position() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  positionStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translateX(-50%)',
  }
  nextTick(() => {
    if (!tooltipRef.value) return
    const tip = tooltipRef.value.getBoundingClientRect()
    if (tip.left < 8) {
      positionStyle.value.left = '8px'
      positionStyle.value.transform = 'translateX(0)'
    } else if (tip.right > window.innerWidth - 8) {
      positionStyle.value.left = `${window.innerWidth - 8}px`
      positionStyle.value.transform = 'translateX(-100%)'
    }
  })
}
</script>
