// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  ssr: true, // Re-enable SSR, but will be used for SSG prerendering
  
  modules: [
    '@nuxt/ui',
    '@vueuse/motion/nuxt',
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/color-mode'
  ],

  runtimeConfig: {
    // Private keys (server-only)
    databaseUrl: process.env.DATABASE_URL,
    adminFirebaseUid: process.env.ADMIN_FIREBASE_UID,
    jwtSecret: process.env.JWT_SECRET,
    dialogflowProjectId: process.env.DIALOGFLOW_PROJECT_ID,
    dialogflowClientEmail: process.env.DIALOGFLOW_CLIENT_EMAIL,
    dialogflowCredentialsBase64: process.env.DIALOGFLOW_CREDENTIALS_BASE64,
    firebaseAdminSdkCredentialsBase64: process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64,
    
    // Public keys (exposed to client)
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@charatech.com',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://your-app.netlify.app' : 'http://localhost:3000')
    }
  },

  app: {
    head: {
      title: 'CharaTech - Software Requirements Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Modern platform for gathering software requirements' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  colorMode: {
    preference: 'dark',
    classSuffix: ''
  },

  css: ['@/assets/css/main.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})
