export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (import.meta.server) return

  const { supabase } = useSupabase()
  const userStore = useUserStore()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    // User is authenticated, fetch their data if not already loaded
    if (!userStore.currentUser) {
      try {
        await userStore.fetchCurrentUser()
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    // Redirect authenticated users away from guest-only pages
    if (userStore.currentUser?.role === 'ADMIN') {
      return navigateTo('/admin/dashboard')
    }
    return navigateTo('/dashboard')
  }
})
