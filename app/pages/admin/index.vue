<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
    <div class="text-center">
      <div class="text-6xl mb-4">🛡️</div>
      <h1 class="text-4xl font-bold text-white mb-4">Admin Area</h1>
      <p class="text-white/70 mb-8">Redirecting to admin dashboard...</p>
      <div class="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})

// Redirect to dashboard
await navigateTo('/admin/dashboard')
</script>
