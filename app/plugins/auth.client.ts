export default defineNuxtPlugin(async () => {
  const { authReady } = useAuth()
  // Wait for auth to be ready before proceeding
  if (import.meta.client) {
    const waitForAuth = () => {
      return new Promise<void>((resolve) => {
        const check = () => {
          if (authReady.value) resolve()
          else setTimeout(check, 50)
        }
        check()
      })
    }
    await waitForAuth()
  }
})
