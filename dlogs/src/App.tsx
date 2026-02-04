import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Clock, ShieldCheck } from 'lucide-react';
import { AddressInput } from './components/AddressInput';
import { ELDLogSheet } from './components/LogSheet';
import { TripMap } from './components/TripMap';
import type { Location, LogSegment } from './constants/types';

interface TripData {
  steps: LogSegment[];
}

export default function App() {
  const [route, setRoute] = useState<(Location | null)[]>([null, null, null]);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>([37.09, -95.71]);
  const [cycle_used, setCycleUsed] = useState<number>(0);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(p => setUserPos([p.coords.latitude, p.coords.longitude]));
  }, []);

  const handleCalculate = async () => {
    if (route.some(r => !r)) return alert("Please fill all locations");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/logs/`, {
        start: [route[0]!.lat, route[0]!.lng],
        pickup: [route[1]!.lat, route[1]!.lng],
        dropoff: [route[2]!.lat, route[2]!.lng],
        cycle_used: cycle_used
      });
      setTripData(res.data);
    } catch (error) {
      console.error("Calculation error:", error);
      alert("Error calculating compliance. Check console for details.");
    }
  };

  const groupedLogs = tripData ? tripData.steps.reduce((acc: Record<number, LogSegment[]>, curr: LogSegment) => {
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
          <h1 className="text-2xl font-black text-gray-800">DLOGS</h1>
        </div>

        <div className="mb-6 text-gray-600">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2"  style={{marginRight: 10}}>
            HOS Cycle Used
          </label>
          <input type="number" value={cycle_used} onChange={e => setCycleUsed(Number(e.target.value))} />
        </div>

        <AddressInput label="Current Location" onSelect={l => setRoute(curr => [l, curr[1], curr[2]])} />
        <AddressInput label="Pickup Point" onSelect={l => setRoute(curr => [curr[0], l, curr[2]])} />
        <AddressInput label="Drop-off Point" onSelect={l => setRoute(curr => [curr[0], curr[1], l])} />

        <button 
          onClick={handleCalculate} 
          className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Clock size={20}/> RUN COMPLIANCE
        </button>

        {tripData && (
          <div className="mt-8 mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-md">
            <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
              <ShieldCheck size={18}/> HOS COMPLIANT
            </div>
          </div>
        )}
      </aside>

      {/* Zone de visualisation */}
      <main className="flex-1 overflow-y-auto p-12">
        <TripMap center={userPos} locations={route} />

        {tripData && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-black text-gray-800 mb-8 self-start uppercase tracking-widest">Logs</h2>
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
                startCityName={route[0]?.name || ""}
                pickUpCityName={route[1]?.name || ""}
                dropOffCityName={route[2]?.name || ""}
                numberOfDays={Object.keys(groupedLogs).length}
              />
            })}
          </div>
        )}
      </main>
    </div>
  );
}