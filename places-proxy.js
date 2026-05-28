const http = require('http');
const https = require('https');
const fs = require('fs');

// Load .env.local manually
try {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) process.env[k.trim()] = v.trim();
  });
} catch(e) {}

const KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
console.log('Using key:', KEY ? KEY.slice(0,10) + '...' : 'NOT FOUND');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const params = new URL(req.url, 'http://localhost').searchParams;
  const lat = params.get('lat');
  const lng = params.get('lng');
  const type = params.get('type');
  const keyword = params.get('keyword');
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${type}&keyword=${encodeURIComponent(keyword)}&key=${KEY}`;
  https.get(url, (r) => {
    let data = '';
    r.on('data', chunk => data += chunk);
    r.on('end', () => { res.writeHead(200, {'Content-Type': 'application/json'}); res.end(data); });
  }).on('error', (e) => { res.writeHead(500); res.end(JSON.stringify({error: e.message})); });
}).listen(3001, () => console.log('Places proxy running on :3001'));
