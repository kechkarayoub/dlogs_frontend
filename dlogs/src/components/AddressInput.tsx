import React, { useState } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';
import type { Location } from '../constants/types';

interface Props {
  label: string;
  onSelect: (loc: Location) => void;
}

export const AddressInput: React.FC<Props> = ({ label, onSelect }) => {
  const [value, setValue] = useState('');

  const handleBlur = async () => {
    if (value.length < 3) return;
    try {
      const res = await axios.get(`https://photon.komoot.io/api/?q=${value}&limit=1`);
      if (res.data.features.length > 0) {
        const f = res.data.features[0];
        onSelect({
          name: value,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0]
        });
      }
    } catch (e) { console.error("Geocoding error", e); }
  };

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
        <MapPin size={14}/> {label}
      </label>
      <input 
        type="text" 
        className="p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
        placeholder="Enter address..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
      />
    </div>
  );
};