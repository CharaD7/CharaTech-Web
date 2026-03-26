<template>
  <div>
    <!-- Confirmed state -->
    <div v-if="status === 'confirmed'" class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Email Confirmed!</h1>
      <p class="text-gray-300 mb-6">Your account is verified. Redirecting to your dashboard…</p>
      <div class="flex justify-center">
        <svg class="animate-spin h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="status === 'error'" class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Confirmation Failed</h1>
      <p class="text-gray-300 mb-6">{{ errorMessage }}</p>
      <NuxtLink
        to="/register"
        class="inline-block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 text-center"
      >
        Back to Register
      </NuxtLink>
    </div>

    <!-- Checking confirmation state -->
    <div v-else-if="status === 'checking'" class="text-center">
      <div class="flex justify-center mb-6">
        <svg class="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p class="text-gray-300">Confirming your email…</p>
    </div>

    <!-- Default: check your email state -->
    <div v-else>
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-white text-center mb-2">Check Your Email</h1>
      <p class="text-gray-300 text-center mb-1">We sent a confirmation link to:</p>
      <p class="text-white font-semibold text-center mb-6 break-all">{{ email || 'your email address' }}</p>

      <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
        <p class="text-gray-300 text-sm text-center">
          Click the link in the email to activate your account. Check your spam folder if you don't see it.
        </p>
      </div>

      <!-- Resend success -->
      <div v-if="resendSuccess" class="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
        <p class="text-green-400 text-sm text-center">Confirmation email resent! Check your inbox.</p>
      </div>

      <!-- Resend error -->
      <div v-if="resendError" class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
        <p class="text-red-400 text-sm text-center">{{ resendError }}</p>
      </div>

      <button
        :disabled="resendLoading || resendCooldown > 0"
        class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition duration-200 flex items-center justify-center gap-2"
        @click="resendEmail"
      >
        <svg v-if="resendLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
        <span v-else-if="resendLoading">Sending…</span>
        <span v-else>Resend Confirmation Email</span>
      </button>

      <p class="text-center text-gray-400 text-sm mt-6">
        Already have an account?
        <NuxtLink to="/login" class="text-purple-400 hover:text-purple-300 font-medium transition">
          Login
        </NuxtLink>
      </p>

      <p class="text-center text-gray-400 text-sm mt-4">
        Wrong email?
        <NuxtLink to="/register" class="text-purple-400 hover:text-purple-300 font-medium transition">
          Sign up again
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { supabase } = useSupabase()

const status = ref<'pending' | 'checking' | 'confirmed' | 'error'>('pending')
const errorMessage = ref('')
const email = ref((route.query.email as string) || '')

const resendLoading = ref(false)
const resendSuccess = ref(false)
const resendError = ref('')
const resendCooldown = ref(0)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // Supabase puts tokens in the URL hash after the user clicks the confirmation link
  if (window.location.hash.includes('access_token')) {
    status.value = 'checking'
    try {
      // The Supabase client automatically processes hash tokens on getSession()
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (session) {
        status.value = 'confirmed'
        setTimeout(() => navigateTo('/dashboard'), 2500)
      } else {
        throw new Error('Could not establish session from confirmation link.')
      }
    } catch (err: any) {
      status.value = 'error'
      errorMessage.value = err.message || 'The confirmation link may have expired. Please request a new one.'
    }
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

async function resendEmail() {
  if (!email.value) {
    resendError.value = 'No email address found. Please sign up again.'
    return
  }

  resendLoading.value = true
  resendSuccess.value = false
  resendError.value = ''

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.value,
    })
    if (error) throw error
    resendSuccess.value = true
    startCooldown(60)
  } catch (err: any) {
    resendError.value = err.message || 'Failed to resend. Please try again.'
  } finally {
    resendLoading.value = false
  }
}

function startCooldown(seconds: number) {
  resendCooldown.value = seconds
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}
</script>
