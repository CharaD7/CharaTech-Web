import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()

  if (!supabase) { // Only create client once
    supabase = createClient(
      config.public.supabaseProjectUrl as string,
      config.public.supabaseAnonKey as string
    )
    nuxtApp._supabaseClient = supabase
  } else {
    supabase = nuxtApp._supabaseClient as SupabaseClient
  }

  return { supabase }
}
