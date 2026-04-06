<template>
  <div class="collab-editor">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-semibold text-white">Real-time Collaboration</h3>
        <div v-if="isInSession" class="flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <BaseBadge variant="success" size="sm">Live</BaseBadge>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton
          v-if="!isInSession"
          variant="primary"
          size="sm"
          :loading="isLoading"
          @click="joinSession"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Start Collaboration
        </BaseButton>
        <BaseButton
          v-else
          variant="secondary"
          size="sm"
          :loading="isLoading"
          @click="leaveSession"
        >
          Leave Session
        </BaseButton>
      </div>
    </div>

    <div v-if="error" class="mb-4">
      <BaseAlert variant="danger" :message="error" dismissible @update:model-value="error = null" />
    </div>

    <div v-if="isInSession" class="glass-morphism rounded-lg p-4 border border-white/10">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-white/70">Participants:</span>
          <div class="flex items-center gap-1">
            <div
              v-for="participant in getOtherParticipants"
              :key="participant.id"
              class="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              :style="{ backgroundColor: participant.cursor?.color + '20', color: participant.cursor?.color }"
            >
              <span
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: participant.cursor?.color || '#888' }"
              ></span>
              {{ participant.cursor?.userName || 'User' }}
            </div>
            <div
              v-if="getOtherParticipants.length === 0"
              class="text-xs text-white/40"
            >
              No other participants yet
            </div>
          </div>
        </div>
        <div class="text-xs text-white/40">
          {{ getOtherParticipants.length + 1 }} participant(s)
        </div>
      </div>

      <div class="text-sm text-white/60">
        Share this page with others to collaborate in real-time. Changes are synced automatically.
      </div>
    </div>

    <div v-else class="text-center py-8 text-white/50">
      <div class="text-4xl mb-3">👥</div>
      <p>Start a collaboration session to edit together in real-time</p>
      <p class="text-sm mt-1">Other users will see your cursor position as you edit</p>
    </div>

    <div
      v-for="participant in getOtherParticipants.filter(p => p.cursor)"
      :key="participant.id + '-cursor'"
      class="fixed pointer-events-none z-50"
      :style="{
        bottom: '20px',
        right: `${20 + getOtherParticipants.indexOf(participant) * 150}px`
      }"
    >
      <div
        class="px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg"
        :style="{
          backgroundColor: participant.cursor?.color,
          color: '#fff'
        }"
      >
        <span class="opacity-75">{{ participant.cursor?.userName }}</span>
        <span class="ml-2 opacity-60">{{ participant.cursor?.field }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollaboration } from '~/composables/useCollaboration'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'

interface Props {
  submissionId: string
}

const props = defineProps<Props>()

const submissionIdRef = computed(() => props.submissionId)
const {
  isInSession,
  isLoading,
  error,
  joinSession,
  leaveSession,
  getOtherParticipants
} = useCollaboration(submissionIdRef)
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
</style>
