<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">Submit Your Requirements</h1>
      <p class="text-white/70">Tell us about your project and we'll help bring it to life</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <BaseCard class="p-8">
          <form @submit.prevent="handleSubmit" class="space-y-8">
            <div v-show="currentStep === 1">
              <h2 class="text-2xl font-bold text-white mb-6">Basic Information</h2>
              
              <div class="space-y-5">
                <BaseInput
                  v-model="formData.projectName"
                  label="Project Name"
                  placeholder="My Awesome Project"
                  required
                />

                <BaseSelect
                  v-model="formData.industry"
                  :options="industryOptions"
                  label="Industry"
                  placeholder="Select Industry"
                  required
                  @update:model-value="onIndustryChange"
                />

                <BaseCheckboxGroup
                  v-model="formData.projectTypes"
                  :options="projectTypeOptions"
                  label="Project Types"
                  hint="Select all that apply"
                  required
                />

                <BaseSelect
                  v-model="formData.complexity"
                  :options="complexityOptions"
                  label="Complexity Level"
                  placeholder="Select Complexity"
                  required
                />

                <BaseSelect
                  v-model="formData.budget"
                  :options="budgetOptions"
                  label="Budget Range"
                  placeholder="Select Budget Range"
                />

                <BaseInput
                  v-model="formData.timeline"
                  label="Timeline"
                  placeholder="e.g., 3 months, 6 weeks"
                />
              </div>
            </div>

            <div v-show="currentStep === 2">
              <h2 class="text-2xl font-bold text-white mb-6">Feature Requirements</h2>
              
              <div class="space-y-6" v-if="requirements.length">
                <BaseCard
                  v-for="category in requirements"
                  :key="category.id"
                  class="p-6"
                >
                  <h3 class="text-xl font-semibold text-white mb-4">
                    {{ category.title }}
                  </h3>
                  <p v-if="category.description" class="text-white/70 text-sm mb-4">
                    {{ category.description }}
                  </p>
                  
                  <div class="space-y-3">
                    <template v-for="item in category.items" :key="item.id">
                      <div class="flex items-start gap-3">
                        <BaseCheckbox
                          v-if="item.type === 'checkbox'"
                          :model-value="!!formData.requirements[item.id]"
                          :label="item.label"
                          @update:model-value="formData.requirements[item.id] = $event"
                        />
                        <BaseInput
                          v-else-if="item.type === 'text'"
                          :model-value="formData.requirements[item.id] || ''"
                          :placeholder="item.label"
                          @update:model-value="formData.requirements[item.id] = $event"
                        />
                        <BaseTextarea
                          v-else-if="item.type === 'textarea'"
                          :model-value="formData.requirements[item.id] || ''"
                          :placeholder="item.label"
                          :rows="3"
                          @update:model-value="formData.requirements[item.id] = $event"
                        />
                      </div>
                    </template>
                  </div>
                </BaseCard>
              </div>
            </div>

            <div v-show="currentStep === 3">
              <h2 class="text-2xl font-bold text-white mb-6">Additional Information</h2>
              
              <BaseTextarea
                v-model="formData.additionalNotes"
                label="Additional Notes or Special Requirements"
                placeholder="Tell us anything else you'd like us to know about your project..."
                :rows="8"
              />
            </div>

            <div class="flex justify-between pt-6 border-t border-white/10">
              <BaseButton
                v-if="currentStep > 1"
                variant="secondary"
                @click="currentStep--"
              >
                Previous
              </BaseButton>
              <div v-else></div>

              <BaseButton
                v-if="currentStep < 3"
                variant="primary"
                @click="currentStep++"
              >
                Next
              </BaseButton>
              <BaseButton
                v-else
                type="submit"
                variant="primary"
                :loading="submitting"
                loading-text="Submitting..."
              >
                Submit Requirements
              </BaseButton>
            </div>

            <div class="mt-6 flex justify-center gap-2">
              <div 
                v-for="step in 3" 
                :key="step"
                :class="[
                  'w-12 h-1 rounded-full transition-all',
                  currentStep >= step ? 'bg-purple-500' : 'bg-white/20'
                ]"
              />
            </div>
          </form>
        </BaseCard>
      </div>

      <div class="lg:col-span-1">
        <BaseCard class="p-6 sticky top-24">
          <div class="flex items-center gap-3 mb-4">
            <div class="text-3xl">🤖</div>
            <h3 class="text-xl font-bold text-white">AI Assistant</h3>
          </div>
          
          <div class="space-y-3 mb-4 max-h-80 overflow-y-auto">
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
            <div v-if="aiLoading" class="p-3 rounded-lg text-sm bg-white/5 mr-4">
              <div class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-white/60">Thinking...</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <input
              v-model="aiInput"
              type="text"
              placeholder="Ask AI for help..."
              class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              @keyup.enter="sendAIMessage"
              :disabled="aiLoading"
            />
            <button
              class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="aiLoading || !aiInput.trim()"
              @click="sendAIMessage"
            >
              <svg v-if="!aiLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <svg v-else class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Industry, ProjectType, ComplexityLevel, BudgetRange } from '@/types'
import { getIndustryRequirements } from '@/config/requirements'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseCheckboxGroup from '@/components/ui/BaseCheckboxGroup.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { user, getAccessToken } = useAuth()
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
})

const requirements = ref<any[]>([])

const industryOptions = Object.values(Industry).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))
const projectTypeOptions = Object.values(ProjectType).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))
const complexityOptions = Object.values(ComplexityLevel).map(v => ({ value: v, label: v }))
const budgetOptions = Object.values(BudgetRange).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))

const onIndustryChange = () => {
  const industryReqs = getIndustryRequirements(formData.industry)
  requirements.value = Array.isArray(industryReqs) ? industryReqs : []
}

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
    const conversationHistory = aiMessages.value
      .filter(m => m.type === 'user' || m.type === 'ai')
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text
      }))

    const response = await $fetch('/api/ollama/chat', {
      method: 'POST',
      body: {
        message: userMessage,
        conversationHistory,
      },
    })

    aiMessages.value.push({ type: 'ai', text: response.response || 'I\'m here to help!' })
  } catch (error) {
    console.error('AI Chat error:', error)
    aiMessages.value.push({ type: 'ai', text: 'Sorry, I encountered an error. Please try again.' })
  } finally {
    aiLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!user.value) return

  submitting.value = true

  try {
    const token = await getAccessToken()
    if (!token) {
      throw new Error('Failed to get authentication token')
    }
    
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
