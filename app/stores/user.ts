import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    loading: false,
  }),

  actions: {
    async fetchCurrentUser() {
      const { user: firebaseUser } = useAuth()
      
      if (!firebaseUser.value) {
        this.currentUser = null
        return
      }

      this.loading = true
      
      try {
        const { data } = await useFetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${await firebaseUser.value.getIdToken()}`,
          },
        })

        this.currentUser = data.value as User
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        this.loading = false
      }
    },

    async updateUser(updates: Partial<User>) {
      const { user: firebaseUser } = useAuth()
      
      if (!firebaseUser.value) return

      this.loading = true

      try {
        const { data } = await useFetch('/api/users/me', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${await firebaseUser.value.getIdToken()}`,
          },
          body: updates,
        })

        this.currentUser = data.value as User
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
