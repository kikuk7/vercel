import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig() as unknown as {
    public: {
      supabaseUrl: string
      supabaseAnonKey: string
    }
  }

  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing!')
  }

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  return {
    provide: {
      supabase
    }
  }
})
