<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
    <!-- Header -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-white/10">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
          <NuxtLink to="/" class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition">
            CharaTech
          </NuxtLink>
          
          <ClientOnly>
            <div class="flex items-center gap-4">
              <template v-if="user">
                <NotificationCenter />
                <NuxtLink 
                  :to="userStore.isAdmin ? '/admin/dashboard' : '/dashboard'"
                  class="text-white hover:text-purple-300 transition text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  {{ userStore.isAdmin ? 'Admin Panel' : 'Dashboard' }}
                </NuxtLink>
                <button
                  @click="handleLogout"
                  class="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition font-medium text-sm border border-red-400/30"
                >
                  Logout
                </button>
              </template>
              <template v-else>
                <NuxtLink 
                  to="/login"
                  class="px-4 py-2 text-white hover:text-purple-300 rounded-lg hover:bg-white/5 transition font-medium text-sm"
                >
                  Login
                </NuxtLink>
                <NuxtLink 
                  to="/register"
                  class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium text-sm shadow-lg"
                >
                  Get Started
                </NuxtLink>
              </template>
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
    <footer class="mt-auto py-8 border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-white/60 text-sm">
            &copy; {{ new Date().getFullYear() }} CharaTech. All rights reserved.
          </p>
          <div class="flex gap-6 text-sm">
            <a href="#" class="text-white/60 hover:text-white transition">Privacy Policy</a>
            <a href="#" class="text-white/60 hover:text-white transition">Terms of Service</a>
            <a href="#" class="text-white/60 hover:text-white transition">Contact</a>
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

const handleLogout = async () => {
  await logout()
  userStore.clearUser()
  router.push('/login')
}
</script>
