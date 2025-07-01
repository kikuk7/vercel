import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.SUPABASE_URL as string
  const supabaseKey = config.public.SUPABASE_ANON_KEY as string

  const supabase = createClient(supabaseUrl, supabaseKey)

  nuxtApp.provide('supabase', supabase)
})
