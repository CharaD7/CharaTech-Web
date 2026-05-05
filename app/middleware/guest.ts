export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  const userStore = useUserStore()
  const { supabase } = useSupabase()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      if (!userStore.currentUser) {
        try {
          await userStore.fetchCurrentUser()
        } catch (error) {
          // Failed to fetch user
        }
      }

      if (userStore.currentUser?.role === 'ADMIN') {
        if (to.path === '/admin/login') {
          return navigateTo('/admin/dashboard')
        }
        return navigateTo('/admin/dashboard')
      }
      return navigateTo('/dashboard')
    }
  } catch (error) {
    return
  }
})
