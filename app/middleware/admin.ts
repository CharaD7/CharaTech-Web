export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
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
      } catch (error) {
        return navigateTo('/admin/login')
      }
    }
  } catch (error) {
    return navigateTo('/admin/login')
  }
   
  if (!userStore.currentUser) {
    return navigateTo('/admin/login')
  }
   
  if (userStore.currentUser.role !== 'ADMIN') {
    return navigateTo('/login')
  }
})
