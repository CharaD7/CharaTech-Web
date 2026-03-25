<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
      <p class="text-gray-300">Sign in to your account</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <BaseInput
        v-model="form.email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        required
        autofocus
        autocomplete="email"
      />

      <BaseInput
        v-model="form.password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        required
        autocomplete="current-password"
      />

      <div class="flex items-center justify-between">
        <BaseCheckbox
          v-model="rememberMe"
          label="Remember me"
        />
        <a href="#" class="text-sm text-purple-300 hover:text-purple-200 font-medium transition">
          Forgot password?
        </a>
      </div>

      <BaseAlert
        v-model="showError"
        variant="danger"
        :message="error"
        dismissible
        @update:model-value="showError = $event"
      />

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
        :loading="loading"
        loading-text="Signing in..."
      >
        Sign In
      </BaseButton>
    </form>

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

const { login, getAccessToken } = useAuth()
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const showError = ref(false)
const rememberMe = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  showError.value = false

  try {
    const result = await login(form.email, form.password)

    if (result.success && result.user) {
      await new Promise(resolve => setTimeout(resolve, 500))

      const token = await getAccessToken()
      
      if (!token) {
        error.value = 'Failed to get authentication token'
        showError.value = true
        loading.value = false
        return
      }

      try {
        const response = await $fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        userStore.currentUser = response as any

        await nextTick()

        if (response.role === 'ADMIN') {
          window.location.replace('/admin/dashboard')
        } else {
          window.location.replace('/dashboard')
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError)
        error.value = apiError.data?.message || 'Failed to fetch user data'
        showError.value = true
        loading.value = false
        return
      }
    } else {
      error.value = result.error || 'Login failed'
      showError.value = true
      loading.value = false
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'An error occurred during login'
    showError.value = true
    loading.value = false
  }
}
</script>
