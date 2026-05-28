import { supabase } from './supabase';

export async function getGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

export async function getGame(id) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function addGame(game) {
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function deleteGame(id) {
  const { error } = await supabase
    .from('games')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) console.error(error);
}
