export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user } = useAuth()
  const userStore = useUserStore()

  // Skip middleware on server-side
  if (import.meta.server) return

  if (user.value) {
    // Check if user is admin
    if (userStore.currentUser?.role === 'ADMIN') {
      return navigateTo('/admin/dashboard')
    }
    return navigateTo('/dashboard')
  }
})
