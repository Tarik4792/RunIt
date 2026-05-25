import { supabase } from './supabase';

export async function getGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getGame(id) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function addGame(game) {
  const { data, error } = await supabase
    .from('games')
    .insert([game])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGame(id) {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
