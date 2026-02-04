import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Clock, ShieldCheck } from 'lucide-react';
import { AddressInput } from './components/AddressInput';
import { LogSheet } from './components/LogSheet';
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
  const [printing, setPrinting] = useState<boolean>(false);

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
      <aside style={printing ? { display: 'none' } : {}} className="w-[380px] bg-white p-8 shadow-xl z-10 overflow-y-auto">
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
          onClick={handleCalculate} style={{marginBottom: 20}}
          className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Clock size={20}/> RUN COMPLIANCE
        </button>

      </aside>

      {/* Zone de visualisation */}
      <main className="flex-1 overflow-y-auto p-12">
        <div  style={printing ? { display: 'none' } : {}}>
          <TripMap center={userPos} locations={route} />
        </div>

        {tripData && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-black text-gray-800 mb-8 self-start uppercase tracking-widest">Logs</h2>
            {Object.entries(groupedLogs).map(([day, segments]) => {
              const dayOffset = parseInt(day) - 1;
              const logDate = new Date();
              logDate.setDate(logDate.getDate() + dayOffset);
              const formattedDate = logDate.toISOString().split('T')[0];
              return <LogSheet 
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
            <button  style={printing ? { display: 'none' } : {marginBottom: 20, marginTop: 20}} 
              onClick={() => {
                setPrinting(true);
                setTimeout(() => {
                  window.print();
                  setPrinting(false);
                }, 500);
              }}
              className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 active:scale-95 print:hidden"
            >
              🖨️ Print All Logs
            </button>
          </div>
        )}
      </main>
    </div>
  );
}