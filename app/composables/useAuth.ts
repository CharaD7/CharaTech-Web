import { ref } from 'vue'

export const useAuth = () => {
  const user = useState<any>('firebase-user', () => null)
  const isInitialized = ref(false)
  const isFirebaseReady = ref(false)

  const waitForFirebase = async () => {
    if (isFirebaseReady.value) return true
    
    const nuxtApp = useNuxtApp()
    const $initFirebase = nuxtApp.$initFirebase
    
    if ($initFirebase) {
      await $initFirebase()
      isFirebaseReady.value = true
      return true
    }
    return false
  }

  const initAuth = async () => {
    const nuxtApp = useNuxtApp()
    const $getFirebaseAuth = nuxtApp.$getFirebaseAuth
    const auth = $getFirebaseAuth?.()
    
    if (auth) {
      const firebase = (window as any).firebase
      
      // Set up auth state listener
      auth.onAuthStateChanged((firebaseUser: any) => {
        user.value = firebaseUser
        isInitialized.value = true
      })
    }
  }

  if (import.meta.client && !isInitialized.value) {
    waitForFirebase().then(() => {
      initAuth()
    })
  }

  const register = async (email: string, password: string, fullName?: string) => {
    await waitForFirebase()
    
    const nuxtApp = useNuxtApp()
    const $getFirebaseAuth = nuxtApp.$getFirebaseAuth
    const auth = $getFirebaseAuth?.()
    
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      const { user: firebaseUser, error } = await auth.createUserWithEmailAndPassword(email, password)
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
    await waitForFirebase()
    
    const nuxtApp = useNuxtApp()
    const $getFirebaseAuth = nuxtApp.$getFirebaseAuth
    const auth = $getFirebaseAuth?.()
    
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      const { user: firebaseUser, error } = await auth.signInWithEmailAndPassword(email, password)
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
    await waitForFirebase()
    
    const nuxtApp = useNuxtApp()
    const $getFirebaseAuth = nuxtApp.$getFirebaseAuth
    const auth = $getFirebaseAuth?.()
    
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      await auth.signOut()
      user.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    await waitForFirebase()
    
    const nuxtApp = useNuxtApp()
    const $getFirebaseAuth = nuxtApp.$getFirebaseAuth
    const auth = $getFirebaseAuth?.()
    
    if (!auth?.currentUser) {
      return null
    }

    try {
      const token = await auth.currentUser.getIdToken()
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
