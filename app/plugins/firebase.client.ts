export default defineNuxtPlugin({
  name: 'firebase',
  enforce: 'pre',
  setup(nuxtApp) {
    const config = useRuntimeConfig()
    
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    }

    let firebasePromise: Promise<void> | null = null;
    let firebaseInitialized = false;

    const loadFirebase = async () => {
      if (firebasePromise) {
        return firebasePromise;
      }

      firebasePromise = new Promise<void>((resolve, reject) => {
        // If Firebase is already loaded and initialized, just resolve
        if ((window as any).firebase && firebaseInitialized) {
          resolve()
          return
        }

        // If Firebase is loaded but not initialized, initialize it
        if ((window as any).firebase && !firebaseInitialized) {
          if (!(window as any).firebase.apps?.length) {
            try {
              ;(window as any).firebase.initializeApp(firebaseConfig)
              firebaseInitialized = true
              resolve()
            } catch (e) {
              reject(e)
            }
          } else {
            firebaseInitialized = true
            resolve()
          }
          return
        }

        // Need to load Firebase from CDN
        const script = document.createElement('script')
        script.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
        script.onload = () => {
          const authScript = document.createElement('script')
          authScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'
          authScript.onload = () => {
            try {
              ;(window as any).firebase.initializeApp(firebaseConfig)
              firebaseInitialized = true
              resolve()
            } catch (e) {
              reject(e)
            }
          }
          authScript.onerror = reject
          document.head.appendChild(authScript)
        }
        script.onerror = reject
        document.head.appendChild(script)
      })

      return firebasePromise
    }

    // Method to get Firebase auth with proper typing
    const getFirebaseAuth = () => {
      // Return the auth instance directly (or null if not available)
      if ((window as any).firebase && typeof (window as any).firebase.auth === 'function') {
        return (window as any).firebase.auth()
      }
      return null
    }

    return {
      provide: {
        initFirebase: loadFirebase,
        getFirebaseAuth: getFirebaseAuth,
        getFirebaseApp: () => (window as any).firebase,
      }
    }
  }
})