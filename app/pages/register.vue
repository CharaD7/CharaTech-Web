<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
      <p class="text-gray-300">Join CharaTech today</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-5">
      <BaseInput
        v-model="form.fullName"
        type="text"
        label="Full Name"
        placeholder="John Doe"
        required
        autofocus
        autocomplete="name"
      />

      <BaseInput
        v-model="form.email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        required
        autocomplete="email"
      />

      <div class="relative z-20">
        <label class="block text-sm font-medium text-white mb-2">
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

      <BaseInput
        v-model="form.companyName"
        type="text"
        label="Company Name"
        placeholder="Your Company Inc."
        hint="(Optional)"
      />

      <BaseInput
        v-model="form.password"
        type="password"
        label="Password"
        placeholder="Minimum 6 characters"
        required
        autocomplete="new-password"
      />

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
        loading-text="Creating account..."
      >
        Create Account
      </BaseButton>
    </form>

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
const showError = ref(false)
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
  showError.value = false

  if (!phoneValid.value && form.phoneNumber) {
    error.value = 'Please enter a valid phone number'
    showError.value = true
    loading.value = false
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    showError.value = true
    loading.value = false
    return
  }

  const result = await register(form.email, form.password, form.fullName)

  if (result.success && result.user) {
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          supabaseUid: result.user.id,
          email: form.email,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          companyName: form.companyName,
        },
      })

      await navigateTo(`/auth/confirm?email=${encodeURIComponent(form.email)}`)
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to create user profile'
      showError.value = true
      loading.value = false
    }
  } else {
    error.value = result.error || 'Registration failed. Please try again.'
    showError.value = true
    loading.value = false
  }
}
</script>

<style>
.vue-tel-input {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  z-index: 9999 !important;
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
  z-index: 9999 !important;
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
