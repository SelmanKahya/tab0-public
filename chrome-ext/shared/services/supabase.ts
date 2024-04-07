import { createClient } from '@supabase/supabase-js';
import { Database } from '@root/src/types/supabase_types';

const supabaseUrl = 'https://fmuzvccxlqtfsgzoeyjc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdXp2Y2N4bHF0ZnNnem9leWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA5MjYxNDQsImV4cCI6MjAyNjUwMjE0NH0.dRFv17F1Hv5h2-3MAhtzbTbhaV579yRSt7U9cFDWsCk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
