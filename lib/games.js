let games = [
  { id: '1', sport: '🏀', title: 'Pickup Basketball', location: 'Rucker Park', distance: '0.3 mi', players: 8, max: 10, time: 'Now', level: 'All levels', address: '116th St & 8th Ave, New York, NY', description: 'Classic Rucker Park run. All skill levels welcome. Half court, make it take it.', host: 'Marcus J.' },
  { id: '2', sport: '⚽', title: 'Soccer Run', location: 'Riverside Field', distance: '0.8 mi', players: 12, max: 18, time: 'In 30 min', level: 'Intermediate', address: 'Riverside Park, New York, NY', description: 'Casual 6v6 soccer. Bring your own cleats. We play rain or shine.', host: 'Diego R.' },
  { id: '3', sport: '🏈', title: 'Tackle Football', location: 'Lincoln Park Field', distance: '1.8 mi', players: 9, max: 22, time: 'In 3 hrs', level: 'Intermediate', address: 'Lincoln Park, Jersey City, NJ', description: 'Full tackle, pads required. 11v11. Bring your helmet and mouthguard.', host: 'Tarik K.' },
  { id: '4', sport: '🏈', title: 'Flag Football', location: 'Central Park', distance: '1.2 mi', players: 6, max: 14, time: 'In 1 hr', level: 'Casual', address: 'Central Park, New York, NY', description: 'No contact, just vibes. 7v7 flag football. Great for all ages.', host: 'Andre M.' },
  { id: '5', sport: '🎾', title: 'Tennis Doubles', location: 'West Side Courts', distance: '1.5 mi', players: 2, max: 4, time: 'In 2 hrs', level: 'Advanced', address: 'West Side Tennis Club, New York, NY', description: 'Looking for two more for competitive doubles. USTA 4.0+ preferred.', host: 'Sarah L.' },
  { id: '6', sport: '🏐', title: 'Beach Volleyball', location: 'East River Park', distance: '2.1 mi', players: 4, max: 8, time: 'Tomorrow 10am', level: 'All levels', address: 'East River Park, New York, NY', description: 'Chill beach volleyball. Sand courts. Bring sunscreen and good energy!', host: 'Priya S.' },
];

export function getGames() {
  return games;
}

export function getGame(id) {
  return games.find(g => g.id === id);
}

export function addGame(game) {
  const newGame = {
    ...game,
    id: String(Date.now()),
    players: 1,
    distance: '0.0 mi',
    address: game.location,
    description: 'Newly created game.',
    host: 'You',
  };
  games = [newGame, ...games];
  return newGame;
}
