// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  ssr: true,
  
  nitro: {
    preset: 'vercel',
    prerender: {
      routes: ['/'],
      failOnError: false
    }
  },
  
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
    jwtSecret: process.env.JWT_SECRET,
    supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
    dialogflowProjectId: process.env.DIALOGFLOW_PROJECT_ID,
    openaiApiKey: process.env.OPENAI_API_KEY,
    adminSupabaseUid: process.env.ADMIN_SUPABASE_UID,
    
    // Public keys (exposed to client)
    public: {
      supabaseProjectUrl: process.env.SUPABASE_PROJECT_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@charatech.com',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      // Firebase Auth
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
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

  build: {
    transpile: ['firebase/app', 'firebase/auth']
  },

  vite: {
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth']
    }
  }
})
