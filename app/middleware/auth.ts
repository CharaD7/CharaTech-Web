export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  if (to.path === '/login' || to.path === '/register' || to.path === '/' || to.path === '/admin/login' || to.path.startsWith('/auth/')) {
    return
  }

  const userStore = useUserStore()
  const { supabase } = useSupabase()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return navigateTo('/login')
    }

    if (!userStore.currentUser) {
      try {
        await userStore.fetchCurrentUser()
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        if (to.path !== '/login') {
          return navigateTo('/login')
        }
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/login')
  }
})
