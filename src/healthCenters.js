// Distance search over HRSA-funded health center sites (data/health-centers.json).
// Health centers must serve everyone regardless of ability to pay and offer a
// sliding fee scale, so they are a key safety-net option for uninsured people.
import { haversineMiles } from './geo.js';

export function createHealthCenterIndex(sites) {
  return {
    count: sites.length,

    search({ lat, lng, radiusMiles, limit = 30 }) {
      const dLat = radiusMiles / 69;
      const dLng = radiusMiles / (69 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
      const hits = [];
      for (const s of sites) {
        if (Math.abs(s.lat - lat) > dLat || Math.abs(s.lng - lng) > dLng) continue;
        const miles = haversineMiles(lat, lng, s.lat, s.lng);
        if (miles <= radiusMiles) hits.push({ ...s, miles: Math.round(miles * 10) / 10 });
      }
      hits.sort((a, b) => a.miles - b.miles);
      return { total: hits.length, results: hits.slice(0, limit) };
    },
  };
}
