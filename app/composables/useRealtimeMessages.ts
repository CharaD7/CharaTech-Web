/**
 * useRealtimeMessages — Supabase Realtime Broadcast for live chat.
 *
 * All chat participants join 'charatech-messages'.
 * Messages are broadcast with full payload; each client filters by their userId.
 *
 * Setup: No extra Supabase config needed — Realtime is enabled by default.
 */

type MessagePayload = {
  id: string
  senderId: string
  receiverId: string
  content: string
  isBot: boolean
  createdAt: string
}

export const useRealtimeMessages = () => {
  const { supabase } = useSupabase()
  let channel: ReturnType<typeof supabase.channel> | null = null
  let subscribed = false

  /**
   * Subscribe to incoming messages.
   * @param userId - the current user's ID (only delivers messages where receiverId matches)
   * @param onMessage - callback when a new message arrives
   */
  const subscribe = (userId: string, onMessage: (msg: MessagePayload) => void) => {
    if (subscribed) return
    channel = supabase.channel('charatech-messages', {
      config: { broadcast: { self: false } },
    })
    channel
      .on('broadcast', { event: 'new_message' }, ({ payload }: { payload: MessagePayload }) => {
        if (payload.receiverId === userId) {
          onMessage(payload)
        }
      })
      .subscribe(() => {
        subscribed = true
      })
  }

  /**
   * Broadcast a new message to the channel so the receiver gets it instantly.
   * Call this after the message has been saved via API.
   */
  const broadcast = async (msg: MessagePayload) => {
    if (!channel) return
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg,
    })
  }

  /** Clean up the Realtime channel subscription */
  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
      subscribed = false
    }
  }

  return { subscribe, broadcast, unsubscribe }
}
