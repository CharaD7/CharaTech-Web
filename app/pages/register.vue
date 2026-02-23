<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
      <p class="text-gray-300">Join CharaTech today</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleRegister" class="space-y-5">
        
        <!-- Full Name -->
        <div>
          <label for="fullName" class="block text-sm font-medium text-white mb-2">
              Full Name
            </label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            required
            class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            placeholder="John Doe"
          />
        </div>

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
            class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            placeholder="you@example.com"
          />
        </div>

        <!-- Phone Number with Country Picker -->
        <div>
          <label for="phone" class="block text-sm font-medium text-white mb-2">
              Phone Number
            </label>
          <vue-tel-input
            v-model="form.phoneNumber"
            mode="international"
            :inputOptions="{
              placeholder: 'Enter phone number',
              styleClasses: 'w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition'
            }"
            :dropdownOptions="{
              showSearchBox: true,
              showDialCodeInSelection: true,
              showFlags: true
            }"
            defaultCountry="US"
            :autoDefaultCountry="false"
            @validate="onPhoneValidate"
          />
          <p v-if="!phoneValid && form.phoneNumber" class="text-xs text-red-300 mt-1">
              Please enter a valid phone number
          </p>
        </div>

        <!-- Company Name -->
        <div>
          <label for="company" class="block text-sm font-medium text-white mb-2">
            Company Name <span class="text-gray-300">(Optional)</span>
          </label>
          <input
            id="company"
            v-model="form.companyName"
            type="text"
            class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            placeholder="Your Company Inc."
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
              minlength="6"
              class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition pr-10"
              placeholder="Minimum 6 characters"
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
          <span v-if="!loading">Create Account</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
        </button>
      </form>

      <!-- Login Link -->
      <p class="mt-6 text-center text-white">
        Already have an account?
        <NuxtLink to="/login" class="text-purple-300 hover:text-purple-200 font-semibold transition">
          Sign in
        </NuxtLink>
      </p>
</div>
</template>

<script setup lang="ts">
import { VueTelInput } from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const { register } = useAuth()
const router = useRouter()

const form = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
  companyName: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const phoneValid = ref(true)

const onPhoneValidate = (phoneObject: any) => {
  phoneValid.value = phoneObject.valid
  if (phoneObject.valid) {
    form.phoneNumber = phoneObject.number
  }
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''

  // Validate phone number
  if (!phoneValid.value && form.phoneNumber) {
    error.value = 'Please enter a valid phone number'
    loading.value = false
    return
  }

  // Validate password length
  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    loading.value = false
    return
  }

  const result = await register(form.email, form.password)

  if (result.success && result.user) {
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          firebaseUid: result.user.uid,
          email: form.email,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          companyName: form.companyName,
        },
      })

      // Wait a bit for the registration to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Use window.location for a full page reload to ensure proper state
      window.location.href = '/dashboard'
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to create user profile'
      loading.value = false
    }
  } else {
    error.value = result.error || 'Registration failed. Please try again.'
    loading.value = false
  }
}
</script>

<style>
/* Override vue-tel-input styles to match glassmorphism design */
.vue-tel-input {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.vue-tel-input:focus-within {
  box-shadow: none !important;
  border: none !important;
}

.vti__dropdown {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 0.5rem 0 0 0.5rem !important;
  padding: 0.75rem !important;
  color: white !important;
}

.vti__dropdown:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

.vti__dropdown.open {
  background: rgba(255, 255, 255, 0.15) !important;
}

.vti__input {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 0 0.5rem 0.5rem 0 !important;
  padding: 0.75rem 1rem !important;
  color: white !important;
}

.vti__input::placeholder {
  color: rgba(255, 255, 255, 0.6) !important;
}

.vti__input:focus {
  outline: none !important;
  border-color: transparent !important;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.5) !important;
}

.vti__dropdown-list {
  background: rgba(17, 24, 39, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
}

.vti__dropdown-item {
  color: white !important;
  padding: 0.75rem 1rem !important;
}

.vti__dropdown-item:hover {
  background: rgba(168, 85, 247, 0.2) !important;
}

.vti__dropdown-item.highlighted {
  background: rgba(168, 85, 247, 0.3) !important;
}

.vti__dropdown-item strong {
  color: white !important;
}

.vti__search_box {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  padding: 0.5rem !important;
  margin: 0.5rem !important;
}

.vti__search_box::placeholder {
  color: rgba(255, 255, 255, 0.6) !important;
}
</style>
