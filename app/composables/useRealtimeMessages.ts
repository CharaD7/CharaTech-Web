/**
 * useRealtimeMessages — Supabase Realtime Broadcast for live chat.
 *
 * Features:
 * - Real-time message delivery via Broadcast
 * - Typing indicators via Broadcast
 * - Periodic polling for offline message recovery
 * - Online presence tracking
 */

type MessagePayload = {
  id: string
  senderId: string
  receiverId: string
  content: string
  isBot: boolean
  read: boolean
  createdAt: string
}

type TypingPayload = {
  senderId: string
  receiverId: string
}

type PresenceState = {
  userId: string
  lastSeen: string
  isTyping?: boolean
}

export const useRealtimeMessages = () => {
  const { supabase } = useSupabase()
  let messageChannel: ReturnType<typeof supabase.channel> | null = null
  let presenceChannel: ReturnType<typeof supabase.channel> | null = null
  let subscribed = false
  let pollInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Subscribe to incoming messages and typing indicators.
   * @param userId - the current user's ID
   * @param onMessage - callback when a new message arrives
   * @param onTyping - callback when other user starts/stops typing
   */
  const subscribe = (
    userId: string,
    onMessage: (msg: MessagePayload) => void,
    onTyping?: (data: TypingPayload) => void
  ) => {
    if (subscribed) return

    // Message broadcast channel
    messageChannel = supabase.channel('charatech-messages', {
      config: { broadcast: { self: false } },
    })

    messageChannel
      .on('broadcast', { event: 'new_message' }, ({ payload }: { payload: MessagePayload }) => {
        if (payload.receiverId === userId) {
          onMessage(payload)
        }
      })

    if (onTyping) {
      messageChannel.on('broadcast', { event: 'typing' }, ({ payload }: { payload: TypingPayload }) => {
        if (payload.receiverId === userId) {
          onTyping(payload)
        }
      })
    }

    messageChannel.subscribe(() => {
      subscribed = true
    })
  }

  /**
   * Broadcast a new message to the channel.
   */
  const broadcast = async (msg: MessagePayload) => {
    if (!messageChannel) return
    await messageChannel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg,
    })
  }

  /**
   * Broadcast typing indicator.
   */
  const broadcastTyping = async (data: TypingPayload) => {
    if (!messageChannel) return
    await messageChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: data,
    })
  }

  /**
   * Set up presence tracking to know who is online.
   */
  const subscribePresence = (
    userId: string,
    onPresenceChange: (onlineUsers: Map<string, PresenceState>) => void
  ) => {
    presenceChannel = supabase.channel(`presence:chat`, {
      config: { presence: { key: userId } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel!.presenceState()
        const onlineUsers = new Map<string, PresenceState>()
        for (const key of Object.keys(state)) {
          const presence = (state as any)[key] as PresenceState[]
          if (presence.length > 0) {
            onlineUsers.set(key, presence[0])
          }
        }
        onPresenceChange(onlineUsers)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        const presence = newPresences as PresenceState[]
        if (presence.length > 0) {
          onPresenceChange(new Map([[key, presence[0]]]))
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        // Presence removed
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel!.track({ userId, lastSeen: new Date().toISOString() })
        }
      })
  }

  /**
   * Update presence status (e.g., typing state).
   */
  const updatePresence = async (data: Partial<PresenceState>) => {
    if (!presenceChannel) return
    await presenceChannel.track({ ...data, lastSeen: new Date().toISOString() })
  }

  /**
   * Start polling for new messages (for offline recovery).
   */
  const startPolling = (
    fetchFn: () => Promise<void>,
    intervalMs: number = 30000
  ) => {
    stopPolling()
    pollInterval = setInterval(fetchFn, intervalMs)
  }

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  /** Clean up all subscriptions */
  const unsubscribe = () => {
    if (messageChannel) {
      supabase.removeChannel(messageChannel)
      messageChannel = null
    }
    if (presenceChannel) {
      supabase.removeChannel(presenceChannel)
      presenceChannel = null
    }
    stopPolling()
    subscribed = false
  }

  return {
    subscribe,
    broadcast,
    broadcastTyping,
    subscribePresence,
    updatePresence,
    startPolling,
    stopPolling,
    unsubscribe,
  }
}
