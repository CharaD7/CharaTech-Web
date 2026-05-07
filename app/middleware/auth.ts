export default defineNuxtRouteMiddleware(async (to) => {
  const publicPaths = ['/login', '/register', '/', '/admin/login', '/submit', '/book']
  
  if (publicPaths.some(p => to.path === p) || to.path.startsWith('/auth/') || to.path.startsWith('/api/')) {
    return
  }

  if (import.meta.client) {
    const { user, authReady } = useAuth()
    
    // Wait for auth to initialize
    if (!authReady.value) {
      await new Promise<void>((resolve) => {
        const check = () => {
          if (authReady.value) resolve()
          else setTimeout(check, 50)
        }
        check()
      })
    }

    if (!user.value) {
      return navigateTo('/login')
    }
  }
})
