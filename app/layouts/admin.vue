<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900">
    <!-- Admin Header -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-gray-900/90 border-b border-red-500/30 shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin" class="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent hover:from-red-300 hover:to-orange-300 transition">
              ⚡ CharaTech Admin
            </NuxtLink>
            <span class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold border border-red-400/30">
              ADMIN PANEL
            </span>
          </div>
          
          <ClientOnly>
            <div class="flex items-center gap-4">
              <NotificationCenter />
              <NuxtLink 
                to="/dashboard"
                class="text-white/70 hover:text-white transition text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5"
              >
                User View
              </NuxtLink>
              <button
                @click="handleLogout"
                class="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition font-medium text-sm border border-red-400/30"
              >
                Logout
              </button>
            </div>
          </ClientOnly>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-auto py-6 border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-white/60 text-sm">
            <span class="text-red-400 font-semibold">Admin Panel</span> | &copy; {{ new Date().getFullYear() }} CharaTech
          </p>
          <div class="flex gap-6 text-sm">
            <span class="text-white/40">Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const userStore = useUserStore()
const router = useRouter()

// Redirect non-admin users
onMounted(async () => {
  if (user.value) {
    await userStore.fetchCurrentUser()
    if (!userStore.isAdmin) {
      router.push('/dashboard')
    }
  } else {
    router.push('/admin/login')
  }
})

const handleLogout = async () => {
  await logout()
  userStore.clearUser()
  router.push('/admin/login')
}
</script>
