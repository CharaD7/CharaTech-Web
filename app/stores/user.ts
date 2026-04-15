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

      const { getAccessToken: getAccessTokenFn } = useAuth()
      const token = await getAccessTokenFn()
     
      if (!token) {
        this.currentUser = null
        return
      }

      this.loading = true
      
      try {
        const response = await useFetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.error?.value) {
          throw new Error('Failed to fetch user')
        }

        this.currentUser = response.data?.value as User
      } catch (error) {
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
