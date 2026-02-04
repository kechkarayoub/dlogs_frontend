import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';
import type { Location } from '../constants/types';

interface PhotonFeature {
  properties: {
    name?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface Props {
  label: string;
  onSelect: (loc: Location) => void;
}

export const AddressInput: React.FC<Props> = ({ label, onSelect }) => {
  const [value, setValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [addresses, setAddresses] = useState<Location[]>([]);

  useEffect(() => {
    if(value.length < 3 || value === selectedValue) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`https://photon.komoot.io/api/?q=${value}&limit=5`);
        if (res.data.features.length > 0) {
          setAddresses(res.data.features.map((feature: PhotonFeature) => ({
            name: feature.properties.name || value,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          })));
        }
      } catch (e) { 
        console.error("Geocoding error", e); 
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col gap-1 mb-4" style={{padding: 10}}>
      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1" style={{width: 200, display: 'inline-block'}}>
        <MapPin size={14}/> {label}
      </label>
      <input 
        type="text" 
        className="p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
        placeholder="Enter address..."
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          setValue(val);
          if (val.length < 3) {
            setAddresses([]);
          }
        }}
      />
      <ul className="bg-white border rounded-xl mt-1 max-h-40 overflow-y-auto">
        {addresses.map((addr, i) => (
          <li 
            style={{padding: 2, marginBottom: 5, cursor: "pointer", color: "green", listStyle: "none"}}
            key={i} 
            className="p-2 cursor-pointer hover:bg-blue-100"
            onClick={() => {
              setSelectedValue(addr.name);
              setValue(addr.name);
              onSelect(addr);
              setAddresses([]);
            }}
          >
            {addr.name}
          </li>
        ))}
      </ul>
    </div>
  );
};