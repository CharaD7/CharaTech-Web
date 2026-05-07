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
                  :error="validationErrors.projectName"
                />

                <BaseSelect
                  v-model="formData.industry"
                  :options="industryOptions"
                  label="Industry"
                  placeholder="Select Industry"
                  required
                  :error="validationErrors.industry"
                  @update:model-value="onIndustryChange"
                />

                <BaseCheckboxGroup
                  v-model="formData.projectTypes"
                  v-model:modelFeatures="formData.projectFeatures"
                  :options="projectTypeOptions"
                  label="Project Types"
                  hint="Select all that apply. Hover over the ⓘ icon for details on each type."
                  required
                />

                <BaseSelect
                  v-model="formData.complexity"
                  :options="complexityOptions"
                  label="Complexity Level"
                  placeholder="Select Complexity"
                  required
                  :error="validationErrors.complexity"
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
              <h2 class="text-2xl font-bold text-white mb-2">Feature Requirements</h2>
              <p class="text-white/60 text-sm mb-6">Select the features you need for your project. Each feature has a brief explanation to help you decide.</p>
              
              <GlowingScrollbar class="space-y-6 max-h-[500px] overflow-y-auto pr-2" v-if="requirements.length">
                <BaseCard
                  v-for="category in requirements"
                  :key="category.id"
                  class="p-6"
                >
                  <div class="flex items-start gap-3 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm flex-shrink-0 mt-0.5">
                      {{ category.title[0] }}
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-white">
                        {{ category.title }}
                      </h3>
                      <p v-if="category.description" class="text-white/50 text-sm mt-0.5">
                        {{ category.description }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="space-y-3 mt-5">
                    <template v-for="item in category.items" :key="item.id">
                      <!-- Checkbox Input -->
                      <div v-if="item.type === 'checkbox'" 
                        :class="[
                          'rounded-xl p-4 border transition-all duration-200',
                          formData.requirements[item.id]
                            ? 'border-purple-500/50 bg-purple-500/10'
                            : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                        ]"
                      >
                        <div class="flex items-start gap-3">
                          <BaseCheckbox
                            :model-value="!!formData.requirements[item.id]"
                            :label="item.label"
                            :required="item.required"
                            @update:model-value="formData.requirements[item.id] = $event"
                          />
                        </div>
                        <div v-if="item.description" class="mt-2 pl-7">
                          <div class="flex items-start gap-2">
                            <svg class="w-4 h-4 text-purple-400/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-sm text-white/50 leading-relaxed">
                              {{ item.description }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Radio Input -->
                      <div v-else-if="item.type === 'radio'" class="space-y-2">
                        <label class="block text-sm font-medium text-white">
                          {{ item.label }}
                          <span v-if="item.required" class="text-red-400">*</span>
                        </label>
                        <div class="space-y-2">
                          <label
                            v-for="option in item.options || []"
                            :key="option"
                            class="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              :name="item.id"
                              :value="option"
                              :checked="formData.requirements[item.id] === option"
                              @change="formData.requirements[item.id] = option"
                              class="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-600"
                            />
                            <span class="text-white">{{ option }}</span>
                          </label>
                        </div>
                        <div v-if="item.description" class="text-sm text-white/50 mt-1">
                          {{ item.description }}
                        </div>
                      </div>

                      <!-- Text Input -->
                      <div v-else-if="item.type === 'text'" class="space-y-2">
                        <label class="block text-sm font-medium text-white">
                          {{ item.label }}
                          <span v-if="item.required" class="text-red-400">*</span>
                        </label>
                        <BaseInput
                          :model-value="formData.requirements[item.id] || ''"
                          :placeholder="item.label"
                          :required="item.required"
                          @update:model-value="formData.requirements[item.id] = $event"
                        />
                        <div v-if="item.description" class="text-sm text-white/50">
                          {{ item.description }}
                        </div>
                      </div>

                      <!-- Textarea Input -->
                      <div v-else-if="item.type === 'textarea'" class="space-y-2">
                        <label class="block text-sm font-medium text-white">
                          {{ item.label }}
                          <span v-if="item.required" class="text-red-400">*</span>
                        </label>
                        <BaseTextarea
                          :model-value="formData.requirements[item.id] || ''"
                          :placeholder="item.label"
                          :rows="3"
                          :required="item.required"
                          @update:model-value="formData.requirements[item.id] = $event"
                        />
                        <div v-if="item.description" class="text-sm text-white/50">
                          {{ item.description }}
                        </div>
                      </div>

                      <!-- Select Input -->
                      <div v-else-if="item.type === 'select'" class="space-y-2">
                        <label class="block text-sm font-medium text-white">
                          {{ item.label }}
                          <span v-if="item.required" class="text-red-400">*</span>
                        </label>
                        <BaseSelect
                          :model-value="formData.requirements[item.id]"
                          :options="(item.options || []).map(opt => ({ value: opt, label: opt }))"
                          :placeholder="`Select ${item.label}`"
                          :required="item.required"
                          @update:model-value="formData.requirements[item.id] = $event"
                        />
                        <div v-if="item.description" class="text-sm text-white/50">
                          {{ item.description }}
                        </div>
                      </div>

                      <!-- Number Input -->
                      <div v-else-if="item.type === 'number'" class="space-y-2">
                        <label class="block text-sm font-medium text-white">
                          {{ item.label }}
                          <span v-if="item.required" class="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          :value="formData.requirements[item.id] || ''"
                          :placeholder="item.label"
                          :required="item.required"
                          @input="formData.requirements[item.id] = $event.target.value"
                          class="w-full px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div v-if="item.description" class="text-sm text-white/50">
                          {{ item.description }}
                        </div>
                      </div>
                    </template>
                  </div>
                </BaseCard>
              </GlowingScrollbar>

              <div v-if="validationErrors.step2" class="mt-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-300 text-sm">
                {{ validationErrors.step2 }}
              </div>

              <div v-else class="text-center py-12">
                <div class="text-6xl mb-4">📋</div>
                <h3 class="text-2xl font-bold text-white mb-2">No Requirements Found</h3>
                <p class="text-white/60 mb-6">Please select an industry to see the relevant requirements.</p>
                <button
                  @click="currentStep = 1"
                  class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  Go Back to Industry Selection
                </button>
              </div>
            </div>

            <div v-show="currentStep === 3">
              <h2 class="text-2xl font-bold text-white mb-6">Project Brief & Media</h2>
              
              <!-- Project Brief Section (Mandatory) -->
              <div class="mb-8">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-red-400">*</span>
                  <h3 class="text-lg font-semibold text-white">Project Brief Description</h3>
                </div>
                <p class="text-white/60 text-sm mb-4">
                  Please provide a clear description of your project requirements. What are your goals? What problem does this project solve? Who are the target users?
                </p>
                <p class="text-purple-300/70 text-xs mb-4 italic">
                  💡 Tip: You can also include YouTube links or URL references to similar projects, inspiration, or examples that illustrate your vision.
                </p>
                
                <BaseTextarea
                  v-model="formData.projectBrief"
                  placeholder="Describe your project in detail..."
                  :rows="6"
                  :error="validationErrors.projectBrief"
                />
                
                <!-- Validation message -->
                <div v-if="!formData.projectBrief && !audioFile" class="mt-2 text-amber-400/80 text-xs flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You must provide either a written brief or an audio recording below.
                </div>
              </div>

              <!-- Audio Recording Section (Alternative to written brief) -->
              <div class="mb-8 p-4 rounded-xl border border-purple-500/20" style="background: rgba(168,85,247,0.05);">
                <div class="flex items-center gap-2 mb-2">
                  <span>🎙️</span>
                  <h3 class="text-lg font-semibold text-white">Audio Recording</h3>
                </div>
                <p class="text-white/60 text-sm mb-4">
                  Prefer to speak? Record your project requirements as an audio file. This serves as an alternative to the written brief above.
                </p>
                
                <div class="flex flex-col sm:flex-row items-center gap-3">
                  <!-- Record Button -->
                  <button
                    type="button"
                    @click="toggleRecording"
                    :class="[
                      'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                      isRecording 
                        ? 'bg-red-500/20 border border-red-500/50 text-red-300 animate-pulse' 
                        : 'bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30'
                    ]"
                  >
                    <svg v-if="!isRecording" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m0 0a7 7 0 017-7m0 0a7 7 0 017 7m0 0h.01" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                    {{ isRecording ? 'Stop Recording' : 'Record Audio' }}
                  </button>

                  <!-- Upload Audio File -->
                  <input
                    ref="audioFileInput"
                    type="file"
                    accept="audio/*"
                    class="hidden"
                    @change="handleAudioFileUpload"
                  />
                  <button
                    type="button"
                    @click="$refs.audioFileInput?.click()"
                    class="px-4 py-3 rounded-xl text-sm font-medium transition border border-white/10 text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m0 0l4 4" />
                    </svg>
                    Upload Audio
                  </button>
                </div>

                <!-- Recording Timer -->
                <div v-if="isRecording" class="mt-3 text-white/50 text-sm font-mono">
                  Recording: {{ recordingTime }}
                </div>

                <!-- Audio File Info -->
                <div v-if="audioFile" class="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">🎵</span>
                    <div>
                      <p class="text-white text-sm font-medium">{{ audioFile.name }}</p>
                      <p class="text-white/40 text-xs">{{ (audioFile.size / 1024).toFixed(1) }} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeAudioFile"
                    class="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- Audio Preview -->
                <audio v-if="audioPreviewUrl" controls class="mt-3 w-full" :src="audioPreviewUrl" />
              </div>

              <!-- Supporting Media (URLs, Images, Videos) -->
              <div class="mt-6">
                <h3 class="text-lg font-semibold text-white mb-4">Supporting Media & References</h3>
                <p class="text-white/60 text-sm mb-4">Add images, videos, or links to support your project idea</p>
                
                <!-- Media Input -->
                <div class="flex gap-2 mb-4">
                  <input
                    v-model="newMediaUrl"
                    type="url"
                    placeholder="Paste image URL, video URL, or link..."
                    class="flex-1 px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    @keyup.enter="addMedia"
                  />
                  <BaseSelect
                    v-model="newMediaType"
                    :options="[
                      { value: 'image', label: 'Image' },
                      { value: 'video', label: 'Video' },
                      { value: 'link', label: 'Link' }
                    ]"
                    selectClass="px-4 py-2"
                  />
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
                <GlowingScrollbar v-if="media.length > 0" class="max-h-80 overflow-y-auto pr-2">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                </GlowingScrollbar>

                <div v-else class="text-center py-8 text-white/40">
                  <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">No media added yet</p>
                </div>
              </div>

              <div v-if="validationErrors.step3" class="mt-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-300 text-sm">
                {{ validationErrors.step3 }}
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
                @click="handleNextStep"
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
          
          <GlowingScrollbar class="space-y-3 mb-4 max-h-80">
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
          </GlowingScrollbar>

          <div class="flex gap-2">
            <input
              v-model="aiInput"
              type="text"
              placeholder="Ask AI for help..."
              class="flex-1 px-4 py-2 bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import AlertWrapper from '@/components/ui/AlertWrapper.vue'
import { useUserLocation } from '@/composables/useUserLocation'

definePageMeta({
  layout: 'default',
  ssr: false
})

const { user, getAccessToken } = useAuth()
const router = useRouter()
const toast = useAppToast()
const { location: userLocation, loading: locationLoading } = useUserLocation()

const currentStep = ref(1)
const submitting = ref(false)
const validationErrors = ref<Record<string, string>>({})

const formData = reactive({
  projectName: '',
  industry: '' as Industry,
  projectTypes: [] as ProjectType[],
  projectFeatures: {} as Record<string, string[]>,
  complexity: '' as ComplexityLevel,
  budget: undefined as BudgetRange | undefined,
  timeline: '',
  requirements: {} as Record<string, any>,
  projectBrief: '',
  additionalNotes: '',
})

const requirements = ref<any[]>([])

const validationRules = {
  1: ['projectName', 'industry', 'projectTypes', 'complexity'],
  2: () => {
    const errors: string[] = []
    requirements.value.forEach(category => {
      category.items.forEach(item => {
        if (item.required && !formData.requirements[item.id]) {
          errors.push(item.label)
        }
      })
    })
    return errors
  },
  3: () => {
    if (!formData.projectBrief && !audioFile.value) {
      return ['A project brief (written or audio recording) is required']
    }
    return []
  }
}

const validateStep = (step: number): boolean => {
  validationErrors.value = {}
  
  if (step === 1) {
    const requiredFields = validationRules[1]
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        validationErrors.value[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} is required`
      }
    })
  } else if (step === 2) {
    const step2Errors = validationRules[2]()
    if (step2Errors.length > 0) {
      validationErrors.value.step2 = 'Required fields: ' + step2Errors.join(', ')
    }
  } else if (step === 3) {
    const step3Errors = validationRules[3]()
    if (step3Errors.length > 0) {
      validationErrors.value.step3 = step3Errors.join(', ')
    }
  }
  
  return Object.keys(validationErrors.value).length === 0
}

const handleNextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  } else {
    const firstError = Object.values(validationErrors.value)[0]
    toast.error(firstError || 'Please fill in all required fields')
  }
}

const handlePrevStep = () => {
  currentStep.value--
  validationErrors.value = {}
}

const industryOptions = Object.values(Industry).map(v => ({ value: v, label: v.replace(/_/g, ' ') }))
const projectTypeOptions = [
  {
    value: ProjectType.WEB_APPLICATION,
    label: 'Web Application',
    description: 'Full-featured web app with backend, database, and interactive UI — accessible from any browser.',
    features: [
      { value: 'user_auth', label: 'User Authentication' },
      { value: 'admin_dashboard', label: 'Admin Dashboard' },
      { value: 'api_integration', label: 'Third-party API Integration' },
      { value: 'database', label: 'Database & Storage' },
      { value: 'real_time', label: 'Real-time Features' },
      { value: 'responsive', label: 'Responsive Design' },
    ],
  },
  {
    value: ProjectType.MOBILE_APPLICATION,
    label: 'Mobile Application',
    description: 'Native or cross-platform mobile app for iOS and/or Android with full device integration.',
    features: [
      { value: 'push_notifications', label: 'Push Notifications' },
      { value: 'offline_mode', label: 'Offline Mode' },
      { value: 'geolocation', label: 'Geolocation & Maps' },
      { value: 'camera', label: 'Camera & Media' },
      { value: 'biometrics', label: 'Biometric Auth' },
      { value: 'in_app_purchases', label: 'In-app Purchases' },
    ],
  },
  {
    value: ProjectType.DESKTOP_APPLICATION,
    label: 'Desktop Application',
    description: 'Cross-platform desktop app for Windows, macOS, and Linux with native OS integration.',
    features: [
      { value: 'file_system', label: 'File System Access' },
      { value: 'offline_first', label: 'Offline-first Architecture' },
      { value: 'os_notifications', label: 'OS-level Notifications' },
      { value: 'auto_updates', label: 'Auto-update System' },
      { value: 'printing', label: 'Printing & Export' },
    ],
  },
  {
    value: ProjectType.API_BACKEND,
    label: 'API / Backend',
    description: 'Scalable server-side API powering your frontend apps with business logic and data management.',
    features: [
      { value: 'rest_graphql', label: 'REST & GraphQL APIs' },
      { value: 'auth_sso', label: 'Auth & SSO' },
      { value: 'rate_limiting', label: 'Rate Limiting & Caching' },
      { value: 'webhooks', label: 'Webhooks & Events' },
      { value: 'documentation', label: 'API Documentation' },
      { value: 'monitoring', label: 'Monitoring & Logging' },
    ],
  },
  {
    value: ProjectType.CMS,
    label: 'CMS (Content Management System)',
    description: 'Easy-to-use content management system for non-technical teams to publish and manage digital content.',
    features: [
      { value: 'wysiwyg_editor', label: 'WYSIWYG Editor' },
      { value: 'media_library', label: 'Media Library' },
      { value: 'roles_permissions', label: 'Roles & Permissions' },
      { value: 'seo_tools', label: 'SEO Tools' },
      { value: 'versioning', label: 'Version History' },
      { value: 'multi_lang', label: 'Multi-language Support' },
    ],
  },
  {
    value: ProjectType.ECOMMERCE_PLATFORM,
    label: 'E-commerce Platform',
    description: 'Full online store with product management, cart, checkout, and payment processing.',
    features: [
      { value: 'product_catalog', label: 'Product Catalog' },
      { value: 'shopping_cart', label: 'Shopping Cart & Checkout' },
      { value: 'payment_gateway', label: 'Payment Gateway' },
      { value: 'inventory', label: 'Inventory Management' },
      { value: 'order_tracking', label: 'Order Tracking' },
      { value: 'reviews', label: 'Reviews & Ratings' },
    ],
  },
  {
    value: ProjectType.CRM,
    label: 'CRM (Customer Relationship Management)',
    description: 'Manage customer interactions, leads, sales pipelines, and support tickets in one place.',
    features: [
      { value: 'contact_mgmt', label: 'Contact Management' },
      { value: 'pipeline_tracking', label: 'Pipeline & Deal Tracking' },
      { value: 'email_integration', label: 'Email Integration' },
      { value: 'task_mgmt', label: 'Task Management' },
      { value: 'reporting', label: 'Reports & Analytics' },
      { value: 'automation', label: 'Workflow Automation' },
    ],
  },
  {
    value: ProjectType.ERP,
    label: 'ERP (Enterprise Resource Planning)',
    description: 'End-to-end business management system covering finance, HR, inventory, procurement, and more.',
    features: [
      { value: 'finance', label: 'Finance & Accounting' },
      { value: 'hr_mgmt', label: 'HR Management' },
      { value: 'inventory', label: 'Inventory & Supply Chain' },
      { value: 'procurement', label: 'Procurement' },
      { value: 'reporting', label: 'Business Intelligence' },
      { value: 'compliance', label: 'Compliance & Audit' },
    ],
  },
  {
    value: ProjectType.SAAS_PLATFORM,
    label: 'SaaS Platform',
    description: 'Subscription-based cloud platform with multi-tenant architecture, billing, and user management.',
    features: [
      { value: 'multi_tenant', label: 'Multi-tenant Architecture' },
      { value: 'subscriptions', label: 'Subscription & Billing' },
      { value: 'user_mgmt', label: 'User & Team Management' },
      { value: 'analytics', label: 'Usage Analytics' },
      { value: 'onboarding', label: 'Onboarding Flows' },
      { value: 'scalability', label: 'Horizontal Scalability' },
    ],
  },
  {
    value: ProjectType.DASHBOARD_ANALYTICS,
    label: 'Dashboard & Analytics',
    description: 'Data visualization dashboard with interactive charts, real-time metrics, and export capabilities.',
    features: [
      { value: 'charts', label: 'Interactive Charts & Graphs' },
      { value: 'real_time', label: 'Real-time Data Streams' },
      { value: 'export', label: 'CSV/PDF Export' },
      { value: 'custom_widgets', label: 'Custom Widgets' },
      { value: 'drill_down', label: 'Drill-down Exploration' },
      { value: 'alerts', label: 'Threshold Alerts' },
    ],
  },
  {
    value: ProjectType.BOOKING_SYSTEM,
    label: 'Booking System',
    description: 'Appointment and reservation system with calendar, availability management, and automated reminders.',
    features: [
      { value: 'calendar', label: 'Calendar View' },
      { value: 'availability', label: 'Availability Management' },
      { value: 'reminders', label: 'Email/SMS Reminders' },
      { value: 'payments', label: 'Online Payments' },
      { value: 'staff_mgmt', label: 'Staff Management' },
      { value: 'waitlist', label: 'Waitlist' },
    ],
  },
  {
    value: ProjectType.PAYMENT_GATEWAY,
    label: 'Payment Gateway',
    description: 'Secure payment processing system supporting multiple payment methods, currencies, and recurring billing.',
    features: [
      { value: 'multiple_providers', label: 'Multiple Payment Providers' },
      { value: 'recurring', label: 'Recurring Billing' },
      { value: 'fraud_detection', label: 'Fraud Detection' },
      { value: 'invoice_gen', label: 'Invoice Generation' },
      { value: 'multi_currency', label: 'Multi-currency Support' },
      { value: 'refunds', label: 'Refund Management' },
    ],
  },
  {
    value: ProjectType.SOCIAL_PLATFORM,
    label: 'Social Platform',
    description: 'Community-driven platform with user profiles, feeds, messaging, and content sharing.',
    features: [
      { value: 'profiles', label: 'User Profiles' },
      { value: 'news_feed', label: 'News Feed' },
      { value: 'messaging', label: 'Real-time Messaging' },
      { value: 'notifications', label: 'Notifications' },
      { value: 'content_moderation', label: 'Content Moderation' },
      { value: 'groups', label: 'Groups & Communities' },
    ],
  },
  {
    value: ProjectType.LEARNING_PLATFORM,
    label: 'Learning Platform',
    description: 'Online education platform with courses, assessments, progress tracking, and certification.',
    features: [
      { value: 'course_builder', label: 'Course Builder' },
      { value: 'assessments', label: 'Quizzes & Assessments' },
      { value: 'progress', label: 'Progress Tracking' },
      { value: 'certificates', label: 'Certification' },
      { value: 'live_classes', label: 'Live Classes' },
      { value: 'forums', label: 'Discussion Forums' },
    ],
  },
  {
    value: ProjectType.MARKETPLACE,
    label: 'Marketplace',
    description: 'Multi-vendor platform connecting buyers and sellers with listings, transactions, and reviews.',
    features: [
      { value: 'vendor_dashboard', label: 'Vendor Dashboard' },
      { value: 'listings', label: 'Product Listings' },
      { value: 'escrow', label: 'Escrow Payments' },
      { value: 'ratings', label: 'Ratings & Reviews' },
      { value: 'disputes', label: 'Dispute Resolution' },
      { value: 'shipping', label: 'Shipping Integration' },
    ],
  },
  {
    value: ProjectType.PORTFOLIO_WEBSITE,
    label: 'Portfolio Website',
    description: 'Personal or business showcase site to display work, skills, and achievements with a polished design.',
    features: [
      { value: 'gallery', label: 'Project Gallery' },
      { value: 'blog', label: 'Integrated Blog' },
      { value: 'contact_form', label: 'Contact Form' },
      { value: 'analytics', label: 'Visitor Analytics' },
      { value: 'seo', label: 'SEO Optimization' },
      { value: 'animations', label: 'Scroll Animations' },
    ],
  },
  {
    value: ProjectType.BLOG,
    label: 'Blog',
    description: 'Content-focused publishing platform with categories, tags, comments, and RSS feeds.',
    features: [
      { value: 'editor', label: 'Rich Text Editor' },
      { value: 'categories', label: 'Categories & Tags' },
      { value: 'comments', label: 'Comments System' },
      { value: 'rss', label: 'RSS Feed' },
      { value: 'newsletter', label: 'Newsletter Integration' },
      { value: 'analytics', label: 'Content Analytics' },
    ],
  },
  {
    value: ProjectType.OTHER,
    label: 'Other',
    description: 'A different type of project not listed above. Describe your needs in the project brief.',
    features: [
      { value: 'consultation', label: 'Free Consultation Call' },
      { value: 'custom_quote', label: 'Custom Quote' },
    ],
  },
]
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

// Audio recording logic
const isRecording = ref(false)
const audioFile = ref<File | null>(null)
const audioPreviewUrl = ref<string | null>(null)
const audioFileInput = ref<HTMLInputElement | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const recordingTimer = ref<ReturnType<typeof setInterval> | null>(null)
const recordingSeconds = ref(0)

const recordingTime = computed(() => {
  const mins = Math.floor(recordingSeconds.value / 60).toString().padStart(2, '0')
  const secs = (recordingSeconds.value % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
})

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    mediaRecorder.value = recorder
    audioChunks.value = []

    recorder.ondataavailable = (e) => {
      audioChunks.value.push(e.data)
    }

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      audioFile.value = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
      audioPreviewUrl.value = URL.createObjectURL(audioBlob)
      stream.getTracks().forEach(t => t.stop())
    }

    recorder.start()
    isRecording.value = true
    recordingSeconds.value = 0
    recordingTimer.value = setInterval(() => {
      recordingSeconds.value++
    }, 1000)
  } catch (err) {
    toast.error('Could not access microphone. Please check permissions.')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
  }
}

const handleAudioFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('audio/')) {
    toast.error('Please select an audio file')
    return
  }

  audioFile.value = file
  audioPreviewUrl.value = URL.createObjectURL(file)
  target.value = ''
}

const removeAudioFile = () => {
  audioFile.value = null
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value)
    audioPreviewUrl.value = null
  }
  recordingSeconds.value = 0
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

    const response = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: {
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'You are Chara, an AI assistant for CharaTech - a software requirements gathering platform.'
          },
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
        stream: false,
      },
    })

    const aiResponse = response.choices?.[0]?.message?.content || 'I\'m here to help!'
    aiMessages.value.push({ type: 'ai', text: aiResponse })
  } catch {
    toast.warning('AI service is temporarily unavailable')
    aiMessages.value.push({ type: 'ai', text: 'Sorry, I encountered an error. Please try again.' })
  } finally {
    aiLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!user.value) {
    router.push('/login')
    return
  }

  if (!validateStep(currentStep.value)) {
    const firstError = Object.values(validationErrors.value)[0]
    toast.error(firstError || 'Please fill in all required fields')
    return
  }

  submitting.value = true

  try {
    const token = await getAccessToken()
    if (!token) {
      throw new Error('Failed to get authentication token')
    }
    
    // Convert audio file to base64 if present
    let audioBase64 = null
    if (audioFile.value) {
      const reader = new FileReader()
      audioBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(audioFile.value!)
      })
    }
    
    await $fetch('/api/submissions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        ...formData,
        audioBrief: audioBase64,
        audioFileName: audioFile.value?.name || null,
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

    toast.success('Requirements submitted successfully!')
    router.push('/dashboard')
  } catch (error: any) {
    toast.error(error.data?.message || 'Failed to submit requirements')
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