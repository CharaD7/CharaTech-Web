import { initializeApp, type FirebaseApp } from 'firebase/app'
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser
} from 'firebase/auth'

export const useFirebase = () => {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()
  
  let app: FirebaseApp
  let auth: Auth

  if (!nuxtApp._firebaseApp) {
    app = initializeApp({
      apiKey: config.public.firebaseApiKey as string,
      authDomain: config.public.firebaseAuthDomain as string,
      projectId: config.public.firebaseProjectId as string,
      storageBucket: config.public.firebaseStorageBucket as string,
      messagingSenderId: config.public.firebaseMessagingSenderId as string,
      appId: config.public.firebaseAppId as string,
    })
    nuxtApp._firebaseApp = app
  } else {
    app = nuxtApp._firebaseApp as FirebaseApp
  }

  if (!nuxtApp._firebaseAuth) {
    auth = getAuth(app)
    nuxtApp._firebaseAuth = auth
  } else {
    auth = nuxtApp._firebaseAuth as Auth
  }

  return { app, auth }
}

export const useAuth = () => {
  const { auth } = useFirebase()
  const user = useState<FirebaseUser | null>('firebase-user', () => null)

  // Only setup auth listener on client-side and after component is mounted
  if (import.meta.client) {
    // Use nextTick to ensure we're in component context
    const nuxtApp = useNuxtApp()
    nuxtApp.hook('app:mounted', () => {
      onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
      })
    })
  }

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error: any) {
      console.error('Firebase registration error:', error)
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error: any) {
      console.error('Firebase login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.'
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      return { success: true }
    } catch (error: any) {
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
