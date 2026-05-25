import { supabase } from './supabase';
import { sendPushNotification } from './notifications';

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

export async function joinGame(gameId, playerName) {
  const game = await getGame(gameId);
  const players = [...(game.players ?? []), playerName];
  const { error } = await supabase
    .from('games')
    .update({ players })
    .eq('id', gameId);
  if (error) throw error;
  await sendPushNotification(
    '🏃 New Player Joined!',
    `${playerName} just joined ${game.title}`,
    gameId
  );
}

export async function leaveGame(gameId, playerName) {
  const game = await getGame(gameId);
  const players = (game.players ?? []).filter(p => p !== playerName);
  const { error } = await supabase
    .from('games')
    .update({ players })
    .eq('id', gameId);
  if (error) throw error;
}
