import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tikebvlvyljimfrffkcf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__JLvKvuygkcr_qHbyILz9g_kuw97CpN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
