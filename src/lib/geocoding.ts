/**
 * Geocode a place name to coordinates using OpenStreetMap Nominatim (free, no API key).
 */

interface GeoResult {
  lat: number;
  lon: number;
}

export async function geocodePlace(place: string): Promise<GeoResult | null> {
  if (!place || place.trim().length < 2) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: place.trim(),
      format: "json",
      limit: "1",
    })}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "CelestialChatApp/1.0" },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    if (isNaN(lat) || isNaN(lon)) return null;

    return { lat, lon };
  } catch {
    return null;
  }
}
