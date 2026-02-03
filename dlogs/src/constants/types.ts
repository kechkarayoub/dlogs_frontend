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
}

export const STATUS_Y: Record<string, number> = {
  OFF_DUTY: 34,
  SLEEPER: 61,
  DRIVING: 88,
  ON_DUTY: 115
};