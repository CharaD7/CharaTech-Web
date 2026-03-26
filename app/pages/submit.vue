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
            <BaseInput
              v-model="aiInput"
              placeholder="Ask AI for help..."
              @keyup.enter="sendAIMessage"
            />
            <BaseButton
              variant="primary"
              :disabled="aiLoading"
              @click="sendAIMessage"
            >
              <svg v-if="!aiLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <BaseSpinner v-else size="sm" />
            </BaseButton>
          </div>
        </BaseCard>
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
  requirements.value = getIndustryRequirements(formData.industry)
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
    const response = await $fetch('/api/ollama/chat', {
      method: 'POST',
      body: {
        message: userMessage,
      },
    })

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
