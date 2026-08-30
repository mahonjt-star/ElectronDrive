export type TripCategory = "Urban" | "Peri-Urban" | "Regional";
export type TripType = "Single" | "Road Trip";

export interface WeatherSnapshot {
  temp: number;
  condition: string;
  precip?: number;
  lat?: number;
  lon?: number;
  locationName?: string;
}

export interface TripWeather {
  start?: WeatherSnapshot;
  end?: WeatherSnapshot;
  waypoints?: WeatherSnapshot[];
  avgTemp?: number;
  overallCondition?: string;
  season?: string;
}

export interface TripPayload {
  people: number;
  dogs: number;
  luggage?: 'None' | 'Low' | 'Medium' | 'High';
  estWeightKg: number;
}

export interface ChargingSession {
  kwhAdded: number;
  newSoc: number;
  cost: number;
}

export interface Trip {
  id?: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  startOdo: number;
  endOdo: number;
  startSOC: number;
  endSOC: number;
  startEstRange?: number;
  endEstRange?: number;
  category: TripCategory;
  tripType?: TripType;
  roadTripName?: string;
  notes?: string;
  distanceKm: number;
  socUsedPct: number;
  estRangeUsed?: number;
  rangeDiffKm?: number;
  rangeAccuracyPct?: number;
  estKWhUsed: number;
  efficiencyKWhPer100Km: number;
  weather?: TripWeather;
  payload?: TripPayload;
  charging?: ChargingSession;
  durationMinutes?: number;
  averageSpeedKph?: number;
}
