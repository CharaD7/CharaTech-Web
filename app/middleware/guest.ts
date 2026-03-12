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
      // If admin is on admin/login, redirect to admin dashboard
      if (to.path === '/admin/login') {
        return navigateTo('/admin/dashboard')
      }
      // If admin is on regular login/register, also redirect to admin dashboard
      return navigateTo('/admin/dashboard')
    }
    // Regular users go to their dashboard
    return navigateTo('/dashboard')
  }
  
  // Not authenticated, allow access to login/register pages
  // This allows the admin/login page to be accessible when not logged in
})
