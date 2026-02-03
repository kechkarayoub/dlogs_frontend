import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import type { Location } from '../constants/types';

interface Props {
  center: [number, number];
  locations: (Location | null)[];
}

export const TripMap = ({ center, locations }: Props) => (
  <div className="h-[400px] w-full rounded-2xl shadow-inner overflow-hidden border-4 border-white mb-8">
    <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc, i) => loc && (
        <Marker key={i} position={[loc.lat, loc.lng]} />
      ))}
    </MapContainer>
  </div>
);