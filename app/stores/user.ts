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
        console.log('No firebase user')
        this.currentUser = null
        return
      }

      this.loading = true
      
      try {
        const token = await firebaseUser.value.getIdToken()
        console.log('Fetching user with token...')
        
        const { data, error } = await useFetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (error.value) {
          console.error('Error fetching user:', error.value)
          throw new Error(error.value.message || 'Failed to fetch user')
        }

        console.log('Fetched user data:', data.value)
        this.currentUser = data.value as User
      } catch (error) {
        console.error('Failed to fetch user:', error)
        throw error
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
