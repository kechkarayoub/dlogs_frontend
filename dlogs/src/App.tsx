import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Clock, ShieldCheck } from 'lucide-react';
import { AddressInput } from './components/AddressInput';
import { ELDLogSheet } from './components/LogSheet';
import { TripMap } from './components/TripMap';
import type { Location, LogSegment } from './constants/types';

interface TripData {
  steps_info: LogSegment[];
}

export default function App() {
  const [route, setRoute] = useState<(Location | null)[]>([null, null, null]);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>([37.09, -95.71]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(p => setUserPos([p.coords.latitude, p.coords.longitude]));
  }, []);

  const handleCalculate = async () => {
    if (route.some(r => !r)) return alert("Please fill all locations");
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/plan-route/`, {
      start: [route[0]!.lng, route[0]!.lat],
      pickup: [route[1]!.lng, route[1]!.lat],
      dropoff: [route[2]!.lng, route[2]!.lat],
      cycle_used: 0
    });
    setTripData(res.data);
  };

  const groupedLogs = tripData ? tripData.steps_info.reduce((acc: Record<number, LogSegment[]>, curr: LogSegment) => {
    if (!acc[curr.day_number]) acc[curr.day_number] = [];
    acc[curr.day_number].push(curr);
    return acc;
  }, {}) : {};

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar de contrôle */}
      <aside className="w-[380px] bg-white p-8 shadow-xl z-10 overflow-y-auto">
        <div className="flex items-center gap-2 mb-10">
          <Truck className="text-blue-600" size={32} />
          <h1 className="text-2xl font-black text-gray-800">SPOTTER <span className="text-blue-600">AI</span></h1>
        </div>

        <AddressInput label="Current Location" onSelect={l => setRoute([l, route[1], route[2]])} />
        <AddressInput label="Pickup Point" onSelect={l => setRoute([route[0], l, route[2]])} />
        <AddressInput label="Drop-off Point" onSelect={l => setRoute([route[0], route[1], l])} />

        <button onClick={handleCalculate} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-6 shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
          <Clock size={20}/> RUN COMPLIANCE
        </button>

        {tripData && (
          <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
              <ShieldCheck size={18}/> HOS COMPLIANT
            </div>
            <p className="text-xs text-green-600">Route analyzed for FMCSA 70h/8days rules.</p>
          </div>
        )}
      </aside>

      {/* Zone de visualisation */}
      <main className="flex-1 overflow-y-auto p-12">
        <TripMap center={userPos} locations={route} />

        {tripData && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-black text-gray-800 mb-8 self-start uppercase tracking-widest">Compliance Logs</h2>
            {Object.entries(groupedLogs).map(([day, segments]) => {
              const dayOffset = parseInt(day) - 1;
              const logDate = new Date();
              logDate.setDate(logDate.getDate() + dayOffset);
              const formattedDate = logDate.toISOString().split('T')[0];
              return <ELDLogSheet 
                key={day} day={parseInt(day)} segments={segments} 
                date={formattedDate}
                driverName="Driver name"
                carrierName="Company name"
              />
            })}
          </div>
        )}
      </main>
    </div>
  );
}