import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://tikebvlvyljimfrffkcf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpa2Vidmx2eWxqaW1mcmZma2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODY3NDcsImV4cCI6MjA5NTE2Mjc0N30.ww8bzRAu80PPeTBjb6yg4XJm-HCXjNyAt967wvsilAw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? localStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
