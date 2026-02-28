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
    jwtSecret: process.env.JWT_SECRET,
    dialogflowProjectId: process.env.DIALOGFLOW_PROJECT_ID,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Public keys (exposed to client)
    public: {
      supabaseProjectUrl: process.env.SUPABASE_PROJECT_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
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
