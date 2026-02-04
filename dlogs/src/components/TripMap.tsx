import { Map, Marker, } from 'pigeon-maps';
import type { Location } from '../constants/types';

// Props interface for TripMap component
// Displays a map with trip locations marked as colored markers
interface Props {
  center: [number, number]; // Map center coordinates [latitude, longitude]
  locations: (Location | null)[]; // Array of trip locations (can include null values)
}

export const TripMap = ({ center, locations }: Props) => {
  // Render a map showing trip locations with color-coded markers
  // - Blue marker: starting location (index 0)
  // - Purple marker: pickup/intermediate location (index 1)
  // - Green marker: dropoff/destination location (index 2+)
  return <div className="h-[400px] w-full rounded-2xl shadow-inner overflow-hidden border-4 border-white mb-8">
    <Map 
      center={center} // Center the map on the specified coordinates
      zoom={5} // Zoom level for the map view
      height={400} // Height of the map in pixels
    >
      
      {/* TODO: draw route lines */}
      {/* Render markers for each location on the map */}
      {/* Color coding: Blue (start) -> Purple (pickup) -> Green (dropoff) */}
      {locations.map((loc, i) => loc && (
        <Marker 
          key={i} 
          anchor={[loc.lat, loc.lng]} // Position marker at location coordinates
          color={
            i === 0 ? '#3b82f6' : // Blue for starting location
            i === 1 ? '#8b5cf6' : // Purple for pickup location
            '#22c55e' // Green for subsequent stops/dropoff
          }
        >
        </Marker>
      ))}
    </Map>
  </div>
}