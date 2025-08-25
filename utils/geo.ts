export type LatLng = { latitude: number; longitude: number };

// Google Encoded Polyline Algorithm Format
// Adapted for clarity and type-safety; not optimized for perf
export function encodePolyline(points: LatLng[], precision = 5): string {
  const factor = Math.pow(10, precision);
  let lastLat = 0;
  let lastLng = 0;
  let result = '';

  for (const p of points) {
    const lat = Math.round(p.latitude * factor);
    const lng = Math.round(p.longitude * factor);
    result += encodeValue(lat - lastLat);
    result += encodeValue(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
  }
  return result;
}

export function decodePolyline(polyline: string, precision = 5): LatLng[] {
  const factor = Math.pow(10, precision);
  let index = 0;
  const len = polyline.length;
  let lat = 0;
  let lng = 0;
  const points: LatLng[] = [];

  while (index < len) {
    const latChange = decodeValue();
    const lngChange = decodeValue();
    lat += latChange;
    lng += lngChange;
    points.push({ latitude: lat / factor, longitude: lng / factor });
  }

  return points;

  function decodeValue(): number {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return (result & 1) ? ~(result >> 1) : (result >> 1);
  }
}

function encodeValue(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1;
  let output = '';
  while (v >= 0x20) {
    output += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  output += String.fromCharCode(v + 63);
  return output;
}

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export function regionForCoordinates(points: LatLng[], paddingFactor = 1.5): Region {
  if (!points.length) {
    return { latitude: 0, longitude: 0, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }
  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max((maxLat - minLat) * paddingFactor, 0.01);
  const longitudeDelta = Math.max((maxLng - minLng) * paddingFactor, 0.01);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}


