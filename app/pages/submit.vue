<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">Submit Your Requirements</h1>
      <p class="text-white/70">Tell us about your project and we'll help bring it to life</p>
      <div v-if="userLocation" class="mt-2 text-sm text-purple-300">
        <span class="inline-flex items-center gap-1">
          📍 Detected: {{ userLocation.country }}
          <span class="text-white/60">({{ userLocation.currency }})</span>
        </span>
      </div>
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
                  :label="`Budget Range (${userLocation?.currencySymbol || '$'})`"
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
              <h2 class="text-2xl font-bold text-white mb-6">Additional Information & Media</h2>
              
              <BaseTextarea
                v-model="formData.additionalNotes"
                label="Additional Notes or Special Requirements"
                placeholder="Tell us anything else you'd like us to know about your project..."
                :rows="6"
              />

              <div class="mt-6">
                <h3 class="text-lg font-semibold text-white mb-4">Supporting Media</h3>
                <p class="text-white/60 text-sm mb-4">Add images, videos, or links to support your project idea</p>
                
                <!-- Media Input -->
                <div class="flex gap-2 mb-4">
                  <input
                    v-model="newMediaUrl"
                    type="url"
                    placeholder="Paste image URL, video URL, or link..."
                    class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    @keyup.enter="addMedia"
                  />
                  <select
                    v-model="newMediaType"
                    class="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                  </select>
                  <button
                    type="button"
                    @click="addMedia"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    :disabled="!newMediaUrl.trim()"
                  >
                    Add
                  </button>
                </div>

                <!-- File Upload -->
                <div class="mb-4">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*,video/*"
                    class="hidden"
                    @change="handleFileUpload"
                  />
                  <button
                    type="button"
                    @click="$refs.fileInput?.click()"
                    class="w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-lg text-white/60 hover:border-purple-500 hover:text-purple-300 transition flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image or Video
                  </button>
                </div>

                <!-- Media Preview Grid -->
                <div v-if="media.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div
                    v-for="(item, index) in media"
                    :key="index"
                    class="relative group rounded-lg overflow-hidden bg-white/5 border border-white/10"
                  >
                    <!-- Image Preview -->
                    <div v-if="item.type === 'image'" class="aspect-video">
                      <img
                        :src="item.url"
                        :alt="item.name || 'Uploaded image'"
                        class="w-full h-full object-cover"
                        @error="handleImageError($event)"
                      />
                    </div>
                    
                    <!-- Video Preview -->
                    <div v-else-if="item.type === 'video'" class="aspect-video">
                      <video
                        :src="item.url"
                        class="w-full h-full object-cover"
                        controls
                      />
                    </div>
                    
                    <!-- Link Preview -->
                    <div v-else class="p-3">
                      <div class="flex items-center gap-2 mb-1">
                        <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span class="text-xs text-purple-300 uppercase">{{ item.type }}</span>
                      </div>
                      <a
                        :href="item.url"
                        target="_blank"
                        class="text-sm text-white hover:text-purple-300 break-all line-clamp-2"
                      >
                        {{ item.url }}
                      </a>
                    </div>

                    <!-- Remove Button -->
                    <button
                      type="button"
                      @click="removeMedia(index)"
                      class="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-white/40">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">No media added yet</p>
                </div>
              </div>
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
import { Industry, ProjectType, ComplexityLevel, BudgetRange, type MediaAttachment } from '@/types'
import { getIndustryRequirements } from '@/config/requirements'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseCheckboxGroup from '@/components/ui/BaseCheckboxGroup.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUserLocation } from '@/composables/useUserLocation'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { user, getAccessToken } = useAuth()
const router = useRouter()
const { location: userLocation, loading: locationLoading } = useUserLocation()

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

// Media handling
const media = ref<MediaAttachment[]>([])
const newMediaUrl = ref('')
const newMediaType = ref<'image' | 'video' | 'link'>('image')
const fileInput = ref<HTMLInputElement | null>(null)

const addMedia = () => {
  if (!newMediaUrl.value.trim()) return
  
  media.value.push({
    id: crypto.randomUUID(),
    type: newMediaType.value,
    url: newMediaUrl.value.trim(),
    name: newMediaUrl.value.split('/').pop() || 'Link',
    createdAt: new Date(),
  })
  
  newMediaUrl.value = ''
}

const removeMedia = (index: number) => {
  media.value.splice(index, 1)
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const url = e.target?.result as string
    
    media.value.push({
      id: crypto.randomUUID(),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url,
      name: file.name,
      createdAt: new Date(),
    })
  }
  reader.readAsDataURL(file)
  
  target.value = ''
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2399%2F99%2F99"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%2F%3E%3C%2Fsvg%3E'
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
        currency: userLocation.value?.currency || 'USD',
        country: userLocation.value?.country,
        media: media.value.map(m => ({
          id: m.id,
          type: m.type,
          url: m.url,
          name: m.name,
          thumbnail: m.thumbnail,
          description: m.description,
        })),
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>