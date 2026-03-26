import { ref } from 'vue'

export const useAuth = () => {
  const { supabase } = useSupabase()
  const user = useState<any>('supabase-user', () => null)
  const isInitialized = ref(false)

  const initAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null
    isInitialized.value = true

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
    })
  }

  if (import.meta.client && !isInitialized.value) {
    initAuth()
  }

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      if (error) {
        console.error('Supabase registration error:', error)
        return { success: false, error: error.message }
      }
      user.value = data.user
      return { success: true, user: data.user, session: data.session }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('Supabase login error:', error)
        return { success: false, error: error.message }
      }
      user.value = data.user
      return { success: true, user: data.user, session: data.session }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error('Failed to get Supabase token:', error)
      return null
    }
  }

  return {
    user,
    register,
    login,
    logout,
    getAccessToken,
  }
}
