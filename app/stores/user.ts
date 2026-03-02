import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    loading: false,
  }),

  actions: {
    async fetchCurrentUser() {
      const { supabase } = useSupabase()
      
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      
      if (!session) {
        console.log('No active session')
        this.currentUser = null
        return
      }

      this.loading = true
      
      try {
        const token = session.access_token
        console.log('Fetching user with token...')
        
        const response = await useFetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.error?.value) {
          console.error('Error fetching user:', response.error.value)
          throw new Error('Failed to fetch user')
        }

        console.log('Fetched user data:', response.data?.value)
        this.currentUser = response.data?.value as User
      } catch (error) {
        console.error('Failed to fetch user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(updates: Partial<User>) {
      const { supabase } = useSupabase()
      
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      
      if (!session) return

      this.loading = true

      try {
        const response = await useFetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: updates,
        })

        this.currentUser = response.data?.value as User
      } catch (error) {
        console.error('Failed to update user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearUser() {
      this.currentUser = null
    },
  },

  getters: {
    isAdmin: (state) => state.currentUser?.role === 'ADMIN',
    isClient: (state) => state.currentUser?.role === 'CLIENT',
  },
})
