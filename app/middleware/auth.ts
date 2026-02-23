export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $user } = useNuxtApp()

  // On server-side, we need to wait for the user to be fetched
  if (import.meta.server) {
    const userStore = useUserStore()
    await userStore.fetchCurrentUser()
    if (!userStore.currentUser) {
      if (to.path !== '/login' && to.path !== '/register' && to.path !== '/') {
        return navigateTo('/login')
      }
    }
  } else {
    // On client-side, we can rely on the $user ref
    if (!$user.value && to.path !== '/login' && to.path !== '/register' && to.path !== '/') {
      return navigateTo('/login')
    }
  }
})
