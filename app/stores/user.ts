import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    loading: false,
  }),

  actions: {
    async fetchCurrentUser() {
      if (import.meta.server) {
        return
      }

      const { supabase } = useSupabase()
      const { getAccessToken: getAccessTokenFn } = useAuth()
      const token = await getAccessTokenFn()
     
      if (!token) {
        console.log('No Supabase token available')
        this.currentUser = null
        return
      }

      this.loading = true
      
      try {
        console.log('Fetching user with Supabase token...')
        
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
      if (import.meta.server) {
        return
      }

      const { getAccessToken: getAccessTokenFn } = useAuth()
      const token = await getAccessTokenFn()
     
      if (!token) {
        console.log('No Supabase token available for update')
        return
      }

      this.loading = true

      try {
        const response = await useFetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
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
