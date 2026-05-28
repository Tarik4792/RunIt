export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const type = searchParams.get('type');
  const keyword = searchParams.get('keyword');
  const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${type}&keyword=${encodeURIComponent(keyword)}&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();
  return Response.json(data);
}
