export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  
  // Wait for auth to initialize
  const { authReady } = useAuth()
  if (!authReady.value) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (authReady.value) resolve()
        else setTimeout(check, 50)
      }
      check()
    })
  }

  const userStore = useUserStore()
  const { supabase } = useSupabase()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return navigateTo('/admin/login')
    }
    
    if (!userStore.currentUser) {
      try {
        await userStore.fetchCurrentUser()
      } catch {
        return navigateTo('/admin/login')
      }
    }
  } catch {
    return navigateTo('/admin/login')
  }
  
  if (!userStore.currentUser) {
    return navigateTo('/admin/login')
  }
  
  if (userStore.currentUser.role !== 'ADMIN') {
    return navigateTo('/login')
  }
})
