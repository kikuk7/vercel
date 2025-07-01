// plugins/supabase.client.js
import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.supabaseUrl;
  const supabaseKey = config.public.supabaseAnonKey;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in runtime config.');
    // Penting: Anda mungkin ingin melemparkan error atau mencegah inisialisasi lebih lanjut
    // jika konfigurasi penting tidak ada di lingkungan produksi.
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Menyediakan instance supabase di `nuxtApp.$supabase`
  nuxtApp.provide('supabase', supabase);
});