import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const { supabase } = useSupabase()
  const user = useState<User | null>('supabase-user', () => null)

  // Client-side: Listen for auth state changes
  if (import.meta.client) {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
    })
  }

  const register = async (email: string, password: string) => {
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        console.error('Supabase registration error:', authError)
        return { success: false, error: authError.message }
      }

      user.value = data.user
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Supabase login error:', authError)
        return { success: false, error: authError.message }
      }

      user.value = data.user
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      const { error: authError } = await supabase.auth.signOut()

      if (authError) {
        console.error('Supabase logout error:', authError)
        return { success: false, error: authError.message }
      }

      user.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    register,
    login,
    logout,
  }
}
