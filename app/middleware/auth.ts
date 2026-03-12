export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side to prevent SSR redirect issues
  if (import.meta.server) return

  const userStore = useUserStore()
  
  try {
    const { supabase } = useSupabase()
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Not authenticated, redirect to login for protected routes
    // Allow access to login, register, homepage, auth callbacks, and admin login
    if (to.path !== '/login' && to.path !== '/register' && to.path !== '/' && to.path !== '/admin/login' && !to.path.startsWith('/auth/')) {
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
  } catch (error) {
    console.error('Auth middleware error:', error)
    // If there's an error, allow navigation to continue for login/register/home/admin-login
    if (to.path !== '/login' && to.path !== '/register' && to.path !== '/' && to.path !== '/admin/login' && !to.path.startsWith('/auth/')) {
      return navigateTo('/login')
    }
  }
})
