<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Header -->
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold text-white mb-1">Admin Login</h1>
      <p class="text-gray-300 text-sm">Administrator Access Only</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-2xl shadow-xl p-6">
      <form @submit.prevent="handleLogin" class="space-y-4">
        
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autofocus
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm text-gray-900"
            placeholder="admin@charatech.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition pr-10 text-sm text-gray-900"
              placeholder="Enter admin password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          <span v-if="!loading">Admin Sign In</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        </button>
      </form>

      <!-- User Login Link -->
      <p class="mt-4 text-center text-gray-600 text-sm">
        Not an admin?
        <NuxtLink to="/login" class="text-purple-600 hover:text-purple-700 font-semibold">
          User Login
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const { login, user, logout } = useAuth()
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await login(form.email, form.password)

    if (!result.success) {
      error.value = result.error || 'Login failed'
      loading.value = false
      return
    }

    // Wait for Firebase auth to update
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Fetch current user from database
    await userStore.fetchCurrentUser()
    
    // Check if admin
    if (userStore.isAdmin) {
      loading.value = false
      await navigateTo('/admin/dashboard', { replace: true })
    } else {
      error.value = 'Access denied. This is for administrators only.'
      loading.value = false
      // Logout non-admin user
      await logout()
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'An error occurred during login'
    loading.value = false
  }
}

// Remove the watch as we handle navigation in handleLogin
// watch(user, (currentUser) => {
//   if (currentUser && !loading.value) {
//     userStore.fetchCurrentUser().then(() => {
//       if (userStore.isAdmin) {
//         navigateTo('/admin/dashboard')
//       } else {
//         error.value = 'Access denied. This is for administrators only.'
//       }
//     }).catch(err => {
//       console.error('Error fetching user:', err)
//       error.value = 'Failed to verify admin status'
//     })
//   }
// }, { immediate: false })
</script>
