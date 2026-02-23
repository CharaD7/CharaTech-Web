<template>
  <div 
    class="container mx-auto px-4 py-20"
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { duration: 800 } }"
  >
    <div class="text-center mb-12">
      <h1 class="text-6xl font-bold text-white mb-6">
        Build Your Dream Software
      </h1>
      <p class="text-xl text-white/80 max-w-2xl mx-auto">
        Tell us what you need, and we'll bring your vision to life. Our intelligent platform makes it easy to specify your requirements.
      </p>
    </div>

    <div class="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
      <div 
        v-for="(feature, i) in features" 
        :key="i"
        class="glass-morphism p-6 rounded-xl text-center"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: i * 100, duration: 500 } }"
      >
        <div class="text-4xl mb-4">{{ feature.icon }}</div>
        <h3 class="text-white font-semibold mb-2">{{ feature.title }}</h3>
        <p class="text-white/70 text-sm">{{ feature.description }}</p>
      </div>
    </div>

    <div class="text-center">
      <NuxtLink to="/register">
        <button class="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
          <span class="text-white">Get Started Now</span>
        </button>
      </NuxtLink>
      <p class="mt-4 text-white/60">
        Already have an account? 
        <NuxtLink to="/login" class="text-purple-300 hover:text-purple-200">
          Login here
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const features = [
  {
    icon: '🎯',
    title: 'Industry-Specific',
    description: 'Tailored questions for your industry'
  },
  {
    icon: '🤖',
    title: 'AI-Powered',
    description: 'Smart assistance via Dialogflow'
  },
  {
    icon: '⚡',
    title: 'Fast & Easy',
    description: 'Submit requirements in minutes'
  },
]
</script>
