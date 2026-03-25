import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

let firebaseApp: any = null
let firebaseAuth: any = null

const initFirebase = async () => {
  if (firebaseApp && firebaseAuth) return { firebaseApp, firebaseAuth }

  if (typeof window !== 'undefined' && !firebaseApp) {
    const config = useRuntimeConfig()
    
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    }

    const { initializeApp, getApps, getAuth } = await import('firebase/app')
    const { getAuth: authGet } = await import('firebase/auth')
    
    const existingApps = getApps()
    firebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig)
    firebaseAuth = getAuth(firebaseApp)
  }

  return { firebaseApp, firebaseAuth: firebaseAuth! }
}

export const useAuth = () => {
  const user = useState<any>('firebase-user', () => null)
  const isInitialized = ref(false)

  if (import.meta.client && !isInitialized.value) {
    initFirebase().then(({ firebaseAuth: auth }) => {
      if (auth) {
        const { onAuthStateChanged } = require('firebase/auth')
        onAuthStateChanged(auth, (firebaseUser: any) => {
          user.value = firebaseUser
          isInitialized.value = true
        })
      }
    })
  }

  const register = async (email: string, password: string, fullName?: string) => {
    const { firebaseAuth: auth } = await initFirebase()
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const { user: firebaseUser, error } = await createUserWithEmailAndPassword(auth, email, password)
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
    const { firebaseAuth: auth } = await initFirebase()
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const { user: firebaseUser, error } = await signInWithEmailAndPassword(auth, email, password)
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
    const { firebaseAuth: auth } = await initFirebase()
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
      user.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    const { firebaseAuth: auth } = await initFirebase()
    if (!auth || !auth.currentUser) {
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
