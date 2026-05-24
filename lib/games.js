import { supabase } from './supabase';

export async function getGames() {
  const { data, error } = await supabase
    .from('games')
    .select(`*, participants(user_id)`)
    .order('created_at', { ascending: false });
  if (error) { console.warn('getGames error:', error.message); return []; }
  return data.map(g => ({ ...g, players: g.participants.length, max: g.max_players, distance: '—' }));
}

export async function getGame(id) {
  const { data, error } = await supabase
    .from('games')
    .select(`*, participants(user_id, profiles(username))`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return {
    ...data,
    players: data.participants.length,
    max: data.max_players,
    distance: '—',
    participantList: data.participants.map(p => p.profiles?.username ?? 'Player'),
  };
}

export async function addGame({ sport, title, location, time, max, level, hostId, hostName }) {
  const { error } = await supabase.from('games').insert({
    sport, title, location, time, max_players: max, level, host_id: hostId, host_name: hostName,
  });
  if (error) throw error;
}

export async function deleteGame(id) {
  const { error } = await supabase.from('games').delete().eq('id', id);
  if (error) throw error;
}

export async function joinGame(gameId, userId) {
  const { error } = await supabase.from('participants').insert({ game_id: gameId, user_id: userId });
  if (error) throw error;
}

export async function leaveGame(gameId, userId) {
  const { error } = await supabase.from('participants').delete()
    .eq('game_id', gameId).eq('user_id', userId);
  if (error) throw error;
}
