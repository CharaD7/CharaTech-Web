<template>
  <div>
    <!-- Loading state -->
    <div v-if="status === 'loading'" class="text-center">
      <div class="flex justify-center mb-6">
        <div class="relative">
          <div class="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg class="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Confirming Your Email</h1>
      <p class="text-gray-300">Please wait while we verify your email address...</p>
    </div>

    <!-- Success state -->
    <div v-else-if="status === 'success'" class="text-center">
      <div class="flex justify-center mb-6">
        <div class="relative">
          <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
            <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Email Confirmed!</h1>
      <p class="text-gray-300 mb-2">Your account has been successfully verified.</p>
      <p class="text-purple-300 text-sm mb-6">You can now sign in with your credentials.</p>
      
      <NuxtLink
        to="/login"
        class="inline-block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 text-center"
      >
        Go to Login
      </NuxtLink>
    </div>

    <!-- Error state -->
    <div v-else-if="status === 'error'" class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Confirmation Failed</h1>
      <p class="text-gray-300 mb-6">{{ errorMessage }}</p>
      
      <div class="space-y-3">
        <NuxtLink
          to="/login"
          class="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 text-center"
        >
          Go to Login
        </NuxtLink>
        
        <NuxtLink
          to="/register"
          class="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg shadow-lg transition duration-200 text-center border border-white/20"
        >
          Create New Account
        </NuxtLink>
      </div>
    </div>

    <!-- Expired token state -->
    <div v-else-if="status === 'expired'" class="text-center">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h1 class="text-2xl font-bold text-white mb-2">Link Expired</h1>
      <p class="text-gray-300 mb-6">This confirmation link has expired. Request a new one below.</p>
      
      <div v-if="resendSuccess" class="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-center gap-2 text-green-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Confirmation email sent! Check your inbox.</span>
        </div>
      </div>

      <div v-if="resendError" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p class="text-red-400 text-sm">{{ resendError }}</p>
      </div>
      
      <button
        :disabled="resendLoading || resendCooldown > 0"
        class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition duration-200 flex items-center justify-center gap-2"
        @click="resendConfirmationEmail"
      >
        <svg v-if="resendLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <svg v-else-if="resendCooldown > 0" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
        <span v-else-if="resendLoading">Sending...</span>
        <span v-else>Resend Confirmation Email</span>
      </button>

      <p class="text-center text-gray-400 text-sm mt-6">
        Remember your password?
        <NuxtLink to="/login" class="text-purple-400 hover:text-purple-300 font-medium transition">
          Sign in
        </NuxtLink>
      </p>
    </div>

    <!-- Pending state - no token in URL -->
    <div v-else>
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <svg class="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-white text-center mb-2">Check Your Email</h1>
      <p class="text-gray-300 text-center mb-1">We sent a confirmation link to:</p>
      <p class="text-white font-semibold text-center mb-6 break-all">{{ confirmedEmail || 'your email address' }}</p>

      <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
        <p class="text-gray-300 text-sm text-center">
          Click the link in the email to activate your account. Check your spam folder if you don't see it.
        </p>
      </div>

      <div class="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
        <p class="text-purple-300 text-xs text-center">
          <strong>Didn't receive the email?</strong><br/>
          It can take a few minutes to arrive. Make sure to check your spam folder.
        </p>
      </div>

      <!-- Resend success -->
      <div v-if="resendSuccess" class="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-center gap-2 text-green-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Email sent! Check your inbox.</span>
        </div>
      </div>

      <!-- Resend error -->
      <div v-if="resendError" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p class="text-red-400 text-sm text-center">{{ resendError }}</p>
      </div>

      <button
        :disabled="resendLoading || resendCooldown > 0"
        class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition duration-200 flex items-center justify-center gap-2"
        @click="resendConfirmationEmail"
      >
        <svg v-if="resendLoading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <svg v-else-if="resendCooldown > 0" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span v-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
        <span v-else-if="resendLoading">Sending...</span>
        <span v-else>Resend Confirmation Email</span>
      </button>

      <p class="text-center text-gray-400 text-sm mt-6">
        Already confirmed?
        <NuxtLink to="/login" class="text-purple-400 hover:text-purple-300 font-medium transition">
          Sign in
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

type ConfirmationStatus = 'pending' | 'loading' | 'success' | 'error' | 'expired'

const status = ref<ConfirmationStatus>('pending')
const errorMessage = ref('')
const confirmedEmail = ref((route.query.email as string) || '')

const resendLoading = ref(false)
const resendSuccess = ref(false)
const resendError = ref('')
const resendCooldown = ref(0)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  const token = route.query.token as string
  const type = route.query.type as string
  const email = route.query.email as string
  
  if (email) {
    confirmedEmail.value = email
  }

  if (token && type === 'email') {
    status.value = 'loading'
    await handleServerSideConfirmation(token, email)
    return
  }

  if (window.location.hash.includes('access_token') || window.location.hash.includes('token_type')) {
    status.value = 'loading'
    await handleHashConfirmation()
    return
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    confirmedEmail.value = session.user.email || ''
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

async function handleServerSideConfirmation(token: string, email: string) {
  try {
    await $fetch('/api/auth/confirm-email', {
      query: { token, email },
    })

    confirmedEmail.value = email
    status.value = 'success'
  } catch (err: any) {
    console.error('Server confirmation error:', err)
    handleConfirmationError(err)
  }
}

async function handleHashConfirmation() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }

    if (session?.user) {
      confirmedEmail.value = session.user.email || ''
      await updateUserEmailVerified(session.user.id)
      
      window.history.replaceState({}, '', window.location.pathname)
      
      status.value = 'success'
    } else {
      const hash = window.location.hash
      if (hash.includes('error') || hash.includes('access_denied')) {
        const errorParam = new URLSearchParams(hash.split('?')[1] || '').get('error') || 'Access denied'
        throw new Error(decodeURIComponent(errorParam))
      }
      throw new Error('Could not establish session from confirmation link')
    }
  } catch (err: any) {
    console.error('Hash confirmation error:', err)
    handleConfirmationError(err)
  }
}

function handleConfirmationError(err: any) {
  const errorMsg = err.data?.message || err.message || ''
  
  if (
    errorMsg.toLowerCase().includes('expired') ||
    errorMsg.toLowerCase().includes('invalid') ||
    errorMsg.toLowerCase().includes('not found') ||
    errorMsg.toLowerCase().includes('not_found')
  ) {
    status.value = 'expired'
    errorMessage.value = 'This confirmation link has expired or is invalid. Please request a new one.'
  } else {
    status.value = 'error'
    errorMessage.value = errorMsg || 'Failed to confirm email. The link may be invalid or expired.'
  }
}

async function updateUserEmailVerified(userId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      await $fetch('/api/users/verify-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
    }
  } catch (err) {
    console.warn('Could not update email verification status:', err)
  }
}

async function resendConfirmationEmail() {
  if (!confirmedEmail.value) {
    resendError.value = 'No email address found. Please sign up again.'
    return
  }

  resendLoading.value = true
  resendSuccess.value = false
  resendError.value = ''

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: confirmedEmail.value,
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
