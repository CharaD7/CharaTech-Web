import { ref } from 'vue'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, type Auth, type User as FirebaseUser } from 'firebase/auth'
import { useRuntimeConfig } from '#app'

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null

const initFirebase = () => {
  if (firebaseApp && firebaseAuth) return { firebaseApp, firebaseAuth }

  const config = useRuntimeConfig()

  if (!firebaseApp && typeof window !== 'undefined') {
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    }

    const existingApps = getApps()
    firebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig)
    firebaseAuth = getAuth(firebaseApp)
  }

  return { firebaseApp, firebaseAuth: firebaseAuth! }
}

export const useAuth = () => {
  const user = useState<FirebaseUser | null>('firebase-user', () => null)
  const isInitialized = ref(false)

  if (import.meta.client && !isInitialized.value) {
    const { firebaseAuth: auth } = initFirebase()
    if (auth) {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        isInitialized.value = true
      })
    }
  }

  const register = async (email: string, password: string, fullName?: string) => {
    const { firebaseAuth: auth } = initFirebase()
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
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
    const { firebaseAuth: auth } = initFirebase()
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
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
    const { firebaseAuth: auth } = initFirebase()
    if (!auth) {
      return { success: false, error: 'Firebase not initialized' }
    }

    try {
      await firebaseSignOut(auth)
      user.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    const { firebaseAuth: auth } = initFirebase()
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
