export default defineNuxtPlugin({
  name: 'firebase',
  enforce: 'pre',
  setup(nuxtApp) {
    const config = useRuntimeConfig()
    
    // Load Firebase from CDN
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    }

    // Load Firebase SDK from CDN
    const loadFirebase = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).firebase?.apps?.length) {
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
