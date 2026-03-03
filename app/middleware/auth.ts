export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore()
  const { supabase } = useSupabase()

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Not authenticated, redirect to login for protected routes
    if (to.path !== '/login' && to.path !== '/register' && to.path !== '/') {
      return navigateTo('/login')
    }
  } else {
    // Authenticated, ensure user data is loaded
    if (!userStore.currentUser) {
      try {
        await userStore.fetchCurrentUser()
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        // If we can't fetch user data, redirect to login
        if (to.path !== '/login') {
          return navigateTo('/login')
        }
      }
    }
  }
})
