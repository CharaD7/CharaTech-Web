import { createClient, type RealtimeChannel } from '@supabase/supabase-js'

export interface CollabCursor {
  id: string
  sessionId: string
  userId: string
  userName: string
  field: string
  position: number
  color: string
  updatedAt: string
}

export interface CollabSession {
  id: string
  submissionId: string
  isActive: boolean
  participants: string[]
  lastActivity: string
}

let supabaseInstance: ReturnType<typeof createClient> | null = null

export const useCollaboration = (submissionId: Ref<string>) => {
  const config = useRuntimeConfig()
  const { user } = useAuth()

  if (!supabaseInstance) {
    supabaseInstance = createClient(
      config.public.supabaseProjectUrl as string,
      config.public.supabaseAnonKey as string
    )
  }

  const session = ref<CollabSession | null>(null)
  const cursors = ref<Map<string, CollabCursor>>(new Map())
  const isInSession = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let channel: RealtimeChannel | null = null

  const fetchSession = async () => {
    try {
      const response = await $fetch(`/api/collab/session/${submissionId.value}`)
      session.value = (response as any).session
      isInSession.value = true
    } catch {
      session.value = null
      isInSession.value = false
    }
  }

  const joinSession = async () => {
    if (!user.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/collab/session', {
        method: 'POST',
        body: {
          submissionId: submissionId.value,
          action: 'join'
        }
      })
      session.value = (response as any).session
      isInSession.value = true
      subscribeToRealtime()
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to join session'
    } finally {
      isLoading.value = false
    }
  }

  const leaveSession = async () => {
    if (!user.value) return

    isLoading.value = true

    try {
      await $fetch('/api/collab/session', {
        method: 'POST',
        body: {
          submissionId: submissionId.value,
          action: 'leave'
        }
      })
      unsubscribeFromRealtime()
      session.value = null
      isInSession.value = false
      cursors.value.clear()
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to leave session'
    } finally {
      isLoading.value = false
    }
  }

  const updateCursor = async (field: string, position: number) => {
    if (!user.value || !session.value) return

    try {
      await $fetch(`/api/collab/cursor`, {
        method: 'PATCH',
        body: { field, position }
      })
    } catch (err: any) {
      console.error('Failed to update cursor:', err)
    }
  }

  const subscribeToRealtime = () => {
    if (!supabaseInstance || !session.value) return

    channel = supabaseInstance
      .channel(`collab:${submissionId.value}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'CollabCursor',
          filter: `sessionId=eq.${session.value.id}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const cursor = payload.new as CollabCursor
            if (cursor.userId !== user.value?.id) {
              cursors.value.set(cursor.userId, cursor)
              cursors.value = new Map(cursors.value)
            }
          } else if (payload.eventType === 'DELETE') {
            const cursor = payload.old as CollabCursor
            cursors.value.delete(cursor.userId)
            cursors.value = new Map(cursors.value)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'CollabSession',
          filter: `id=eq.${session.value.id}`
        },
        (payload: any) => {
          const updated = payload.new as CollabSession
          if (updated.participants !== session.value?.participants) {
            session.value = updated
          }
        }
      )
      .subscribe()
  }

  const unsubscribeFromRealtime = () => {
    if (channel && supabaseInstance) {
      supabaseInstance.removeChannel(channel)
      channel = null
    }
  }

  const getCursorForField = (field: string): CollabCursor | undefined => {
    for (const cursor of cursors.value.values()) {
      if (cursor.field === field) {
        return cursor
      }
    }
    return undefined
  }

  const getOtherParticipants = computed(() => {
    if (!session.value || !user.value) return []
    return session.value.participants
      .filter((p: string) => p !== user.value?.id)
      .map((p: string) => ({
        id: p,
        cursor: Array.from(cursors.value.values()).find(c => c.userId === p)
      }))
  })

  onMounted(async () => {
    await fetchSession()
    if (isInSession.value) {
      subscribeToRealtime()
    }
  })

  onUnmounted(() => {
    if (isInSession.value) {
      leaveSession()
    }
    unsubscribeFromRealtime()
  })

  watch(submissionId, async (newId, oldId) => {
    if (oldId && isInSession.value) {
      await leaveSession()
    }
    if (newId) {
      await fetchSession()
      if (isInSession.value) {
        subscribeToRealtime()
      }
    }
  })

  return {
    session,
    cursors,
    isInSession,
    isLoading,
    error,
    joinSession,
    leaveSession,
    updateCursor,
    getCursorForField,
    getOtherParticipants
  }
}
