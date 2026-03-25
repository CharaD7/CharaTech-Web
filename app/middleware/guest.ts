export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (import.meta.server) return

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
      // Allow access to login/register pages when Firebase is not ready
      return
    }
    
    const auth = getFirebaseAuth()
    
    if (!auth) {
      console.error('Firebase auth instance is not available')
      // Allow access to login/register pages when Firebase is not ready
      return
    }
    
    const firebaseUser = auth.currentUser
  
    if (firebaseUser) {
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
  } catch (error) {
    console.error('Guest middleware error:', error)
    // Allow access to login/register pages when there's an error
    return
  }
})
