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

    const loadFirebase = () => {
      if (firebasePromise) {
        return firebasePromise;
      }

      firebasePromise = new Promise<void>((resolve, reject) => {
        // If Firebase is already loaded, we just need to initialize the app if not done
        if ((window as any).firebase) {
          if (!(window as any).firebase.apps?.length) {
            ;(window as any).firebase.initializeApp(firebaseConfig)
          }
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
        script.onload = () => {
          const authScript = document.createElement('script')
          authScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'
          authScript.onload = () => {
            ;(window as any).firebase.initializeApp(firebaseConfig)
            resolve()
          }
          authScript.onerror = reject
          document.head.appendChild(authScript)
        }
        script.onerror = reject
        document.head.appendChild(script)
      })

      return firebasePromise
    }

    return {
      provide: {
        initFirebase: loadFirebase,
        getFirebaseAuth: () => (window as any).firebase?.auth(),
        getFirebaseApp: () => (window as any).firebase,
      }
    }
  }
})