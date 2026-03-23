/**
 * Geocode a place name to coordinates using OpenStreetMap Nominatim (free, no API key).
 * Works globally for all countries and cities.
 */

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
}

const USER_AGENT = "AstroChat/1.0 (support@astrochat.ge)";

export async function geocodePlace(place: string): Promise<GeoResult | null> {
  if (!place || place.trim().length < 2) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q: place.trim(),
      format: "json",
      limit: "1",
      "accept-language": "en",
    })}`;

    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    const displayName = data[0].display_name || place.trim();

    if (isNaN(lat) || isNaN(lon)) return null;

    return { lat, lon, displayName };
  } catch {
    return null;
  }
}
