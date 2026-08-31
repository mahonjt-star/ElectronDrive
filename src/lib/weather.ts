import { format } from 'date-fns';

export interface WeatherSnapshot {
  temp: number;
  condition: string;
  precip?: number;
  lat?: number;
  lon?: number;
  locationName?: string;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    if (!res.ok) return null;
    const data = await res.json();
    return { temp: data.temp, condition: data.condition, precip: data.precip, lat: data.lat, lon: data.lon, locationName: data.locationName };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    });
  });
}

export function getSeason(date: Date): string {
  const month = date.getMonth(); // 0-11
  // Australian Seasons: Summer: Dec(11), Jan(0), Feb(1) | Autumn: Mar(2), Apr(3), May(4) | Winter: Jun(5), Jul(6), Aug(7) | Spring: Sep(8), Oct(9), Nov(10)
  if (month === 11 || month <= 1) return 'Summer';
  if (month >= 2 && month <= 4) return 'Autumn';
  if (month >= 5 && month <= 7) return 'Winter';
  return 'Spring';
}
