<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">Submit Your Requirements</h1>
      <p class="text-white/70">Tell us about your project and we'll help bring it to life</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Main Form -->
      <div class="lg:col-span-2">
        <div class="glass-morphism p-8 rounded-xl">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Step 1: Basic Information -->
            <div v-show="currentStep === 1">
              <h2 class="text-2xl font-bold text-white mb-6">Basic Information</h2>
              
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Project Name <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="formData.projectName"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="My Awesome Project"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Industry <span class="text-red-400">*</span>
                  </label>
                  <select
                    v-model="formData.industry"
                    required
                    @change="onIndustryChange"
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none bg-no-repeat bg-right pr-10"
                    style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-size: 1.5em; background-position: right 0.5rem center;"
                  >
                    <option value="" disabled class="bg-gray-900 text-white/40">Select Industry</option>
                    <option v-for="option in industryOptions" :key="option.value" :value="option.value" class="bg-gray-900 text-white">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Project Types <span class="text-red-400">*</span>
                  </label>
                  <div class="space-y-2 bg-white/5 p-4 rounded-lg border border-white/20 max-h-64 overflow-y-auto">
                    <label 
                      v-for="option in projectTypeOptions" 
                      :key="option.value"
                      class="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition"
                    >
                      <input
                        type="checkbox"
                        :value="option.value"
                        v-model="formData.projectTypes"
                        class="w-5 h-5 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      />
                      <span class="text-white">{{ option.label }}</span>
                    </label>
                  </div>
                  <p class="text-xs text-white/60 mt-1">Select all that apply</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Complexity Level <span class="text-red-400">*</span>
                  </label>
                  <select
                    v-model="formData.complexity"
                    required
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none bg-no-repeat bg-right pr-10"
                    style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-size: 1.5em; background-position: right 0.5rem center;"
                  >
                    <option value="" disabled class="bg-gray-900 text-white/40">Select Complexity</option>
                    <option v-for="option in complexityOptions" :key="option.value" :value="option.value" class="bg-gray-900 text-white">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Budget Range
                  </label>
                  <select
                    v-model="formData.budget"
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none bg-no-repeat bg-right pr-10"
                    style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-size: 1.5em; background-position: right 0.5rem center;"
                  >
                    <option value="" disabled class="bg-gray-900 text-white/40">Select Budget Range</option>
                    <option v-for="option in budgetOptions" :key="option.value" :value="option.value" class="bg-gray-900 text-white">
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-white mb-2">
                    Timeline
                  </label>
                  <input
                    v-model="formData.timeline"
                    type="text"
                    class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., 3 months, 6 weeks"
                  />
                </div>
              </div>
            </div>

            <!-- Step 2: Requirements -->
            <div v-show="currentStep === 2">
              <h2 class="text-2xl font-bold text-white mb-6">Feature Requirements</h2>
              
              <div class="space-y-6" v-if="requirements.length">
                <div 
                  v-for="category in requirements" 
                  :key="category.id"
                  class="bg-white/5 p-6 rounded-lg"
                >
                  <h3 class="text-xl font-semibold text-white mb-4">
                    {{ category.title }}
                  </h3>
                  <p v-if="category.description" class="text-white/70 text-sm mb-4">
                    {{ category.description }}
                  </p>
                  
                  <div class="space-y-3">
                    <div 
                      v-for="item in category.items" 
                      :key="item.id"
                      class="flex items-start gap-3"
                    >
                      <label v-if="item.type === 'checkbox'" class="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          v-model="formData.requirements[item.id]"
                          class="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span class="text-white">{{ item.label }}</span>
                      </label>
                      <input 
                        v-else-if="item.type === 'text'"
                        v-model="formData.requirements[item.id]"
                        type="text"
                        :placeholder="item.label"
                        class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      />
                      <textarea 
                        v-else-if="item.type === 'textarea'"
                        v-model="formData.requirements[item.id]"
                        :placeholder="item.label"
                        rows="3"
                        class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Additional Notes -->
            <div v-show="currentStep === 3">
              <h2 class="text-2xl font-bold text-white mb-6">Additional Information</h2>
              
              <div>
                <label class="block text-sm font-medium text-white mb-2">
                  Additional Notes or Special Requirements
                </label>
                <textarea 
                  v-model="formData.additionalNotes" 
                  rows="8"
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Tell us anything else you'd like us to know about your project..."
                />
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between pt-6 border-t border-white/10">
              <button 
                v-if="currentStep > 1"
                @click="currentStep--" 
                type="button"
                class="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                Previous
              </button>
              <div v-else></div>

              <button 
                v-if="currentStep < 3"
                @click="currentStep++" 
                type="button"
                class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                Next
              </button>
              <button 
                v-else
                type="submit" 
                :disabled="submitting"
                class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span v-if="!submitting">Submit Requirements</span>
                <span v-else class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              </button>
            </div>

          </form>

          <!-- Progress Indicator -->
          <div class="mt-6 flex justify-center gap-2">
            <div 
              v-for="step in 3" 
              :key="step"
              :class="[
                'w-12 h-1 rounded-full transition-all',
                currentStep >= step ? 'bg-purple-500' : 'bg-white/20'
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- AI Assistant Sidebar -->
      <div class="lg:col-span-1">
        <div class="glass-morphism p-6 rounded-xl sticky top-24">
          <div class="flex items-center gap-3 mb-4">
            <div class="text-3xl">🤖</div>
            <h3 class="text-xl font-bold text-white">AI Assistant</h3>
          </div>
          
          <div class="space-y-3 mb-4 max-h-96 overflow-y-auto">
            <div 
              v-for="(msg, i) in aiMessages" 
              :key="i"
              :class="[
                'p-3 rounded-lg text-sm',
                msg.type === 'user' ? 'bg-purple-500/20 ml-4' : 'bg-white/5 mr-4'
              ]"
            >
              <p class="text-white">{{ msg.text }}</p>
            </div>
          </div>

          <div class="flex gap-2">
            <input
              v-model="aiInput"
              type="text"
              placeholder="Ask AI for help..."
              @keyup.enter="sendAIMessage"
              class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            <button
              @click="sendAIMessage"
              :disabled="aiLoading"
              class="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50"
            >
              <svg v-if="!aiLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Industry, ProjectType, ComplexityLevel, BudgetRange } from '@/types'
import { getIndustryRequirements } from '@/config/requirements'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { user } = useAuth()
const router = useRouter()

const currentStep = ref(1)
const submitting = ref(false)

const formData = reactive({
  projectName: '',
  industry: '' as Industry,
  projectTypes: [] as ProjectType[],
  complexity: '' as ComplexityLevel,
  budget: undefined as BudgetRange | undefined,
  timeline: '',
  requirements: {} as Record<string, any>,
  additionalNotes: '',
  dialogflowSessionId: '',
})

const requirements = ref<any[]>([])

const industryOptions = Object.values(Industry).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))
const projectTypeOptions = Object.values(ProjectType).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))
const complexityOptions = Object.values(ComplexityLevel).map(v => ({ value: v, label: v }))
const budgetOptions = Object.values(BudgetRange).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))

const onIndustryChange = () => {
  requirements.value = getIndustryRequirements(formData.industry)
}

// AI Integration
const aiMessages = ref<Array<{ type: 'user' | 'ai', text: string }>>([
  { type: 'ai', text: 'Hi! I\'m here to help you with your requirements. Feel free to ask me anything!' }
])
const aiInput = ref('')
const aiLoading = ref(false)

const sendAIMessage = async () => {
  if (!aiInput.value.trim()) return

  const userMessage = aiInput.value
  aiMessages.value.push({ type: 'user', text: userMessage })
  aiInput.value = ''
  aiLoading.value = true

  try {
    const response = await $fetch('/api/dialogflow/chat', {
      method: 'POST',
      body: {
        message: userMessage,
        sessionId: formData.dialogflowSessionId || undefined,
      },
    })

    if (response.sessionId) {
      formData.dialogflowSessionId = response.sessionId
    }

    aiMessages.value.push({ type: 'ai', text: response.response || 'I\'m here to help!' })
  } catch (error) {
    aiMessages.value.push({ type: 'ai', text: 'Sorry, I encountered an error. Please try again.' })
  } finally {
    aiLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!user.value) return

  submitting.value = true

  try {
    const token = await user.value.getIdToken()
    
    await $fetch('/api/submissions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        ...formData,
        aiConversation: aiMessages.value,
      },
    })

    router.push('/dashboard')
  } catch (error: any) {
    console.error('Submission error:', error)
    alert('Failed to submit requirements. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>
