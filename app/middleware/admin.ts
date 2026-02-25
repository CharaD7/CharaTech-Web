export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client-side
  if (import.meta.server) {
    return
  }

  const userStore = useUserStore()
  
  // Wait for user data to be available
  if (!userStore.currentUser) {
    try {
      await userStore.fetchCurrentUser()
    } catch (error) {
      console.error('Error fetching user:', error)
      return navigateTo('/admin/login')
    }
  }
  
  // Check if user exists and is admin
  if (!userStore.currentUser) {
    return navigateTo('/admin/login')
  }
  
  if (userStore.currentUser.role !== 'ADMIN') {
    return navigateTo('/login')
  }
})
