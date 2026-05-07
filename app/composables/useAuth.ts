import { ref } from 'vue'

const _initialized = ref(false)
const _authReady = ref(false)

export const useAuth = () => {
  const { supabase } = useSupabase()
  const user = useState<any>('supabase-user', () => null)

  const initAuth = async () => {
    if (_initialized.value) return
    _initialized.value = true

    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
    } catch {
      user.value = null
    } finally {
      _authReady.value = true
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
      _authReady.value = true
    })
  }

  if (import.meta.client && !_initialized.value) {
    initAuth()
  } else if (import.meta.server) {
    _authReady.value = true
  }

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) return { success: false, error: error.message }
      user.value = data.user
      return { success: true, user: data.user, session: data.session }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { success: false, error: error.message }
      user.value = data.user
      return { success: true, user: data.user, session: data.session }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch {
      return null
    }
  }

  return {
    user,
    authReady: _authReady,
    register,
    login,
    logout,
    getAccessToken,
  }
}
