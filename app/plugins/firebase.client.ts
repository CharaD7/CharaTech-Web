export default defineNuxtPlugin({
  name: 'firebase',
  enforce: 'pre',
  async setup() {
    const config = useRuntimeConfig()
    
    const firebaseApp = await import('firebase/app')
    const firebaseAuth = await import('firebase/auth')
    
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    }

    const app = firebaseApp.getApps().length > 0 
      ? firebaseApp.getApps()[0] 
      : firebaseApp.initializeApp(firebaseConfig)
    
    const auth = firebaseAuth.getAuth(app)

    return {
      provide: {
        firebaseApp: app,
        firebaseAuth: auth,
        firebaseSignInWithEmailAndPassword: firebaseAuth.signInWithEmailAndPassword,
        firebaseCreateUserWithEmailAndPassword: firebaseAuth.createUserWithEmailAndPassword,
        firebaseSignOut: firebaseAuth.signOut,
        firebaseOnAuthStateChanged: firebaseAuth.onAuthStateChanged,
      }
    }
  }
})
