<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Floating chat widget — shown for authenticated non-admin clients only -->
    <ClientOnly>
      <ChatBubble v-if="showChatBubble" />
    </ClientOnly>
    <!-- Global Alert Wrapper -->
    <AlertWrapper ref="alertWrapper" />
  </div>
</template>

<script setup lang="ts">
import AlertWrapper from '@/components/ui/AlertWrapper.vue'

const { user } = useAuth()

// Show chat bubble only for logged-in non-admin clients
const showChatBubble = computed(() => {
  if (!user.value) return false
  const role = (user.value.user_metadata?.role || user.value.app_metadata?.role || 'CLIENT')
  return role !== 'ADMIN'
})

// Expose alert methods globally
const alertWrapper = ref()

const showAlert = (variant: 'info' | 'warning' | 'danger' | 'success', message: string, title?: string) => {
  alertWrapper.value?.addAlert(variant, message, title)
}

// Make showAlert available globally
provide('showAlert', showAlert)
</script>
