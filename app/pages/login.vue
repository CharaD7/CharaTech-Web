<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
      <p class="text-gray-300">Sign in to your account</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="space-y-5">
        
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-2">
            Email Address
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autofocus
            class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            placeholder="you@example.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-white mb-2">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
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

        <!-- Remember & Forgot -->
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" class="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-400 focus:ring-offset-0">
            <span class="ml-2 text-sm text-white">Remember me</span>
          </label>
          <a href="#" class="text-sm text-purple-300 hover:text-purple-200 font-medium transition">
            Forgot password?
          </a>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-500/20 border border-red-400/50 text-white px-4 py-3 rounded-lg backdrop-blur-sm">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          <span v-if="!loading">Sign In</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        </button>
      </form>

      <!-- Register Link -->
      <p class="mt-6 text-center text-white">
        Don't have an account?
        <NuxtLink to="/register" class="text-purple-300 hover:text-purple-200 font-semibold transition">
          Create one
        </NuxtLink>
      </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const { login } = useAuth()
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

    if (result.success && result.user) {
      // Wait for Firebase to fully authenticate
      await new Promise(resolve => setTimeout(resolve, 500))

      // Get fresh ID token
      const idToken = await result.user.getIdToken(true)

      // Fetch current user from API with token
      try {
        const response = await $fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        // Update user store
        userStore.currentUser = response as any

        // Small delay for state update
        await nextTick()

        // Force full page navigation based on role
        if (response.role === 'ADMIN') {
          window.location.replace('/admin/dashboard')
        } else {
          window.location.replace('/dashboard')
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError)
        error.value = apiError.data?.message || 'Failed to fetch user data'
        loading.value = false
        return
      }
    } else {
      error.value = result.error || 'Login failed'
      loading.value = false
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'An error occurred during login'
    loading.value = false
  }
}
</script>
