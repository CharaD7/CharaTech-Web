import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

export const useAuth = () => {
  const user = useState<any>('firebase-user', () => null)
  const isInitialized = ref(false)

  const initAuth = () => {
    const { $firebaseAuth, $firebaseOnAuthStateChanged } = useNuxtApp()
    
    if ($firebaseAuth && $firebaseOnAuthStateChanged) {
      $firebaseOnAuthStateChanged($firebaseAuth, (firebaseUser: any) => {
        user.value = firebaseUser
        isInitialized.value = true
      })
    }
  }

  if (import.meta.client && !isInitialized.value) {
    initAuth()
  }

  const register = async (email: string, password: string, fullName?: string) => {
    const { $firebaseCreateUserWithEmailAndPassword, $firebaseAuth } = useNuxtApp()
    
    if (!$firebaseAuth || !$firebaseCreateUserWithEmailAndPassword) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      const { user: firebaseUser, error } = await $firebaseCreateUserWithEmailAndPassword($firebaseAuth, email, password)
      if (error) {
        console.error('Firebase registration error:', error)
        return { success: false, error: error.message }
      }
      user.value = firebaseUser
      return { success: true, user: firebaseUser }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { success: false, error: error.message }
    }
  }

  const login = async (email: string, password: string) => {
    const { $firebaseSignInWithEmailAndPassword, $firebaseAuth } = useNuxtApp()
    
    if (!$firebaseAuth || !$firebaseSignInWithEmailAndPassword) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      const { user: firebaseUser, error } = await $firebaseSignInWithEmailAndPassword($firebaseAuth, email, password)
      if (error) {
        console.error('Firebase login error:', error)
        return { success: false, error: error.message }
      }
      user.value = firebaseUser
      return { success: true, user: firebaseUser }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    const { $firebaseSignOut } = useNuxtApp()
    
    if (!$firebaseSignOut) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      await $firebaseSignOut()
      user.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    const { $firebaseAuth } = useNuxtApp()
    
    if (!$firebaseAuth || !$firebaseAuth.currentUser) {
      return null
    }

    try {
      const token = await $firebaseAuth.currentUser.getIdToken()
      return token
    } catch (error) {
      console.error('Failed to get Firebase token:', error)
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
