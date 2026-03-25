import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    loading: false,
  }),

  actions: {
    async fetchCurrentUser() {
      // Only run on client-side
      if (import.meta.server) {
        return
      }

      // Wait for Firebase to be initialized
      const nuxtApp = useNuxtApp()
      const $initFirebase = nuxtApp.$initFirebase
      await $initFirebase()

      // Get Firebase ID token
      const { getAccessToken } = useAuth()
      const token = await getAccessToken()
      
      if (!token) {
        console.log('No Firebase token available')
        this.currentUser = null
        return
      }

      this.loading = true
      
      try {
        console.log('Fetching user with Firebase token...')
        
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
      // Only run on client-side
      if (import.meta.server) {
        return
      }

      // Wait for Firebase to be initialized
      const nuxtApp = useNuxtApp()
      const $initFirebase = nuxtApp.$initFirebase
      await $initFirebase()

      // Get Firebase ID token
      const { getAccessToken } = useAuth()
      const token = await getAccessToken()
      
      if (!token) {
        console.log('No Firebase token available for update')
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
