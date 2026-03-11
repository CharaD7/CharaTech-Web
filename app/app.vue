<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Floating chat widget — shown for authenticated non-admin clients only -->
    <ClientOnly>
      <ChatBubble v-if="showChatBubble" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()

// Show chat bubble only for logged-in non-admin clients
const showChatBubble = computed(() => {
  if (!user.value) return false
  const role = (user.value.user_metadata?.role || user.value.app_metadata?.role || 'CLIENT')
  return role !== 'ADMIN'
})
</script>
