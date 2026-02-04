import { Map, Marker, } from 'pigeon-maps';
import type { Location } from '../constants/types';

interface Props {
  center: [number, number];
  locations: (Location | null)[];
}

export const TripMap = ({ center, locations }: Props) => {
  return <div className="h-[400px] w-full rounded-2xl shadow-inner overflow-hidden border-4 border-white mb-8">
    <Map 
      center={center} 
      zoom={5}
      height={400}
    >
      
      {/* Markers */}
      {locations.map((loc, i) => loc && (
        <Marker 
          key={i} 
          anchor={[loc.lat, loc.lng]}
          color={i === 0 ? '#3b82f6' : i === 1 ? '#8b5cf6' : '#22c55e'}
        >
        </Marker>
      ))}
    </Map>
  </div>
}