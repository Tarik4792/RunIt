import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const webStorage = {
  getItem: (key) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key, value) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.setItem(key, value) : null),
  removeItem: (key) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.removeItem(key) : null),
};

const secureStorage = {
  getItem: (key) => SecureStore.getItemAsync(key).catch(() => null),
  setItem: (key, value) => SecureStore.setItemAsync(key, value).catch(() => null),
  removeItem: (key) => SecureStore.deleteItemAsync(key).catch(() => null),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
