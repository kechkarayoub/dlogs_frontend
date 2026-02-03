import { Map, Marker, Overlay, GeoJson } from 'pigeon-maps';
import type { Location } from '../constants/types';

interface Props {
  center: [number, number];
  locations: (Location | null)[];
}

const RouteLine = ({ from, to, color }: { from: Location; to: Location; color: string }) => {
  return (
    <Overlay anchor={[(from.lat + to.lat) / 2, (from.lng + to.lng) / 2]} offset={[0, 0]}>
      <svg
        style={{
          position: 'absolute',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
        width="1000"
        height="1000"
      >
        <line
          x1="500"
          y1="500"
          x2={500 + (to.lng - from.lng) * 100}
          y2={500 + (from.lat - to.lat) * 100}
          stroke={color}
          strokeWidth="3"
          strokeDasharray="5,5"
        />
      </svg>
    </Overlay>
  );
};

export const TripMap = ({ center, locations }: Props) => {
  const routeData = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [-73.9857, 40.7484], // Point A [lng, lat]
        [-74.0060, 40.7128]  // Point B [lng, lat]
      ]
    }
  };
  return <div className="h-[400px] w-full rounded-2xl shadow-inner overflow-hidden border-4 border-white mb-8">
    <Map 
      center={center} 
      zoom={5}
      height={400}
    >
      {/* Blue line from route[0] to route[1] */}
      {locations[0] && locations[1] && (
        <RouteLine from={locations[0]} to={locations[1]} color="#3b82f6" />
      )}
      
      {/* Green line from route[1] to route[2] */}
      {locations[1] && locations[2] && (
        <RouteLine from={locations[1]} to={locations[2]} color="#22c55e" />
      )}
      {locations.length > 1 && <GeoJson
        data={routeData}
        styleCallback={(feature: any) => {
          if (feature.geometry.type === 'LineString') {
            return {
              strokeWidth: '4', // Épaisseur de la ligne
              stroke: '#3b82f6', // Couleur bleue
              strokeOpacity: 0.8
            }
          }
        }}
      />}
      
      {/* Markers */}
      {locations.map((loc, i) => loc && (
        <Marker 
          key={i} 
          anchor={[loc.lat, loc.lng]}
          color={i === 0 ? '#3b82f6' : i === 1 ? '#8b5cf6' : '#22c55e'}
        />
      ))}
    </Map>
  </div>
}