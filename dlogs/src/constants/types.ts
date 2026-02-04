export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface LogSegment {
  status: 'OFF_DUTY' | 'SLEEPER' | 'DRIVING' | 'ON_DUTY';
  duration: number;
  start_hour: number;
  end_hour: number;
  label: string;
  day_number: number;
  miles_moved: number;
}

export const STATUS_Y: Record<string, number> = {
  OFF_DUTY: 196,
  SLEEPER: 215,
  DRIVING: 230,
  ON_DUTY: 245
};