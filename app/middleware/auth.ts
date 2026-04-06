export default defineNuxtRouteMiddleware((to) => {
  const publicPaths = ['/login', '/register', '/', '/admin/login', '/submit', '/book']
  
  if (publicPaths.some(p => to.path === p) || to.path.startsWith('/auth/') || to.path.startsWith('/api/')) {
    return
  }

  if (import.meta.client) {
    const { user } = useAuth()
    if (!user.value) {
      return navigateTo('/login')
    }
  }
})
