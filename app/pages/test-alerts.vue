<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-4xl font-bold text-white mb-8">Alert Component Test</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BaseCard class="p-6">
        <h2 class="text-2xl font-bold text-white mb-4">Test Alerts</h2>
        <div class="space-y-3">
          <button
            @click="showAlert('success', 'This is a success message!', 'Success')"
            class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Show Success Alert
          </button>
          
          <button
            @click="showAlert('info', 'This is an info message!', 'Information')"
            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Show Info Alert
          </button>
          
          <button
            @click="showAlert('warning', 'This is a warning message!', 'Warning')"
            class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
          >
            Show Warning Alert
          </button>
          
          <button
            @click="showAlert('danger', 'This is an error message!', 'Error')"
            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Show Error Alert
          </button>
        </div>
      </BaseCard>
      
      <BaseCard class="p-6">
        <h2 class="text-2xl font-bold text-white mb-4">Alert Component Preview</h2>
        <p class="text-white/70 mb-4">The alerts will appear in the top-right corner of the screen.</p>
        <div class="space-y-2 text-sm text-white/60">
          <p>✅ Success: Green gradient with checkmark icon</p>
          <p>ℹ️ Info: Purple gradient with info icon</p>
          <p>⚠️ Warning: Yellow gradient with warning icon</p>
          <p>❌ Danger: Red gradient with error icon</p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'

const { showAlert } = useAuth()

// Inject showAlert from global provide
const globalShowAlert = inject('showAlert', (variant: string, message: string, title?: string) => {
  console.log(`Alert: ${variant} - ${title || 'No title'} - ${message}`)
})
</script>