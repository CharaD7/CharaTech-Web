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
        console.error('Error fetching user:', error)
        return navigateTo('/admin/login')
      }
    }
  } catch (error) {
    console.error('Admin middleware error:', error)
    return navigateTo('/admin/login')
  }
   
  if (!userStore.currentUser) {
    return navigateTo('/admin/login')
  }
   
  if (userStore.currentUser.role !== 'ADMIN') {
    return navigateTo('/login')
  }
})
