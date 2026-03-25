export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client-side
  if (import.meta.server) {
    return
  }
 
  const userStore = useUserStore()
  
  try {
    // Wait for Firebase to be initialized
    const nuxtApp = useNuxtApp()
    const $initFirebase = nuxtApp.$initFirebase
    await $initFirebase()

    // Check if user is authenticated using Firebase (same pattern as in useAuth)
    const { getFirebaseAuth } = nuxtApp
    
    // Check if getFirebaseAuth exists and is a function
    if (typeof getFirebaseAuth !== 'function') {
      console.error('Firebase auth is not available')
      return navigateTo('/admin/login')
    }
    
    const auth = getFirebaseAuth()
    
    if (!auth) {
      console.error('Firebase auth instance is not available')
      return navigateTo('/admin/login')
    }
    
    const firebaseUser = auth.currentUser
    
    // Wait for user data to be available
    if (!firebaseUser) {
      return navigateTo('/admin/login')
    }
    
    // If we don't have user data yet, try to fetch it
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
   
  // Check if user exists and is admin
  if (!userStore.currentUser) {
    return navigateTo('/admin/login')
  }
   
  if (userStore.currentUser.role !== 'ADMIN') {
    return navigateTo('/login')
  }
})
