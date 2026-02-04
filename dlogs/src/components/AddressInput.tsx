import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin } from 'lucide-react';
import type { Location } from '../constants/types';

// Type definition for Photon API geocoding response structure
interface PhotonFeature {
  properties: {
    name?: string; // Address name returned from Photon geocoding API
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude] from API (note: swapped order)
  };
}

// Props for the AddressInput component
interface Props {
  label: string; // Display label for the input field
  onSelect: (loc: Location) => void; // Callback function when address is selected
}

export const AddressInput: React.FC<Props> = ({ label, onSelect }) => {
  // Input field value as user types
  const [value, setValue] = useState('');
  // Value of the selected address (used to prevent duplicate API calls)
  const [selectedValue, setSelectedValue] = useState('');
  // Array of address suggestions from geocoding API
  const [addresses, setAddresses] = useState<Location[]>([]);

  // Effect: Fetch address suggestions as user types
  // Uses Photon API for geocoding with debouncing to minimize API calls
  useEffect(() => {
    // Skip API call if input is too short or hasn't changed since last selection
    if(value.length < 3 || value === selectedValue) {
      return;
    }

    // Debounce the API request by 10ms to avoid excessive calls while typing
    const timer = setTimeout(async () => {
      try {
        // Call Photon geocoding API with search query (max 5 results)
        const res = await axios.get(`https://photon.komoot.io/api/?q=${value}&limit=5`);
        if (res.data.features.length > 0) {
          // Transform API response to Location objects
          // Note: API returns [longitude, latitude], we need to swap to [latitude, longitude]
          setAddresses(res.data.features.map((feature: PhotonFeature) => ({
            name: feature.properties.name || value,
            lat: feature.geometry.coordinates[1], // latitude (2nd element)
            lng: feature.geometry.coordinates[0]  // longitude (1st element)
          })));
        }
      } catch (e) { 
        console.error("Geocoding error", e); 
      }
    }, 10);

    // Cleanup: cancel pending requests when component unmounts or value changes
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col gap-1 mb-4" style={{padding: 10}}>
      {/* Label with map pin icon */}
      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1" style={{width: 200, display: 'inline-block'}}>
        <MapPin size={14}/> {label}
      </label>
      
      {/* Text input field for address search */}
      <input 
        type="text" 
        className="p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
        placeholder="Enter address..."
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          setValue(val);
          // Clear suggestions if input is too short
          if (val.length < 3) {
            setAddresses([]);
          }
        }}
      />
      
      {/* Dropdown list of address suggestions */}
      <ul className="bg-white border rounded-xl mt-1 max-h-40 overflow-y-auto">
        {addresses.map((addr, i) => (
          <li 
            style={{padding: 2, marginBottom: 5, cursor: "pointer", color: "green", listStyle: "none"}}
            key={i} 
            className="p-2 cursor-pointer hover:bg-blue-100"
            onClick={() => {
              // Update both input fields and trigger parent callback
              setSelectedValue(addr.name);
              setValue(addr.name);
              onSelect(addr); // Notify parent component of selection
              setAddresses([]); // Clear suggestions dropdown
            }}
          >
            {addr.name}
          </li>
        ))}
      </ul>
    </div>
  );
};