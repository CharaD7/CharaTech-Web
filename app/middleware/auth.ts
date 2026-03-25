export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side to prevent SSR redirect issues
  if (import.meta.server) return

  // Allow access to login, register, homepage, auth callbacks, and admin login
  if (to.path === '/login' || to.path === '/register' || to.path === '/' || to.path === '/admin/login' || to.path.startsWith('/auth/')) {
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
      return navigateTo('/login')
    }
    
    // Call getFirebaseAuth to get the auth instance (same as in useAuth)
    const auth = getFirebaseAuth()
    
    if (!auth) {
      console.error('Firebase auth instance is not available')
      return navigateTo('/login')
    }
    
    const firebaseUser = auth.currentUser
  
    if (!firebaseUser) {
      // Not authenticated, redirect to login
      return navigateTo('/login')
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
    // If there's an error, redirect to login
    return navigateTo('/login')
  }
})
