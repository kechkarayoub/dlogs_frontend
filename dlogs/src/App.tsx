import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Clock, ShieldCheck } from 'lucide-react';
import { AddressInput } from './components/AddressInput';
import { LogSheet } from './components/LogSheet';
import { TripMap } from './components/TripMap';
import type { Location, LogSegment } from './constants/types';

// API response structure containing daily driving logs
interface TripData {
  steps: LogSegment[]; // Array of log segments (each segment is a status period during a day)
}

export default function App() {
  // Route locations: [current location, pickup point, dropoff point]
  const [route, setRoute] = useState<(Location | null)[]>([null, null, null]);
  // Compliance log data returned from backend API
  const [tripData, setTripData] = useState<TripData | null>(null);
  // Current user position [latitude, longitude] (defaults to US center)
  const [userPos, setUserPos] = useState<[number, number]>([37.09, -95.71]);
  // Hours of Service cycle already used by the driver
  const [cycle_used, setCycleUsed] = useState<number>(0);
  // Flag to hide sidebar when printing
  const [printing, setPrinting] = useState<boolean>(false);

  // Effect: Get user's current location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(p => setUserPos([p.coords.latitude, p.coords.longitude]));
  }, []);

  // Handler: Submit route data to backend API for HOS compliance calculation
  const handleCalculate = async () => {
    // Validate that all three locations are selected
    if (route.some(r => !r)) return alert("Please fill all locations");
    try {
      // Call backend endpoint with trip details and HOS cycle hours used
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

  // Group log segments by day number for organized display
  // Creates an object where keys are day numbers and values are arrays of segments for that day
  const groupedLogs = tripData ? tripData.steps.reduce((acc: Record<number, LogSegment[]>, curr: LogSegment) => {
    if (!acc[curr.day_number]) acc[curr.day_number] = [];
    acc[curr.day_number].push(curr);
    return acc;
  }, {}) : {};

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Control Sidebar: Input fields, route configuration, and compliance check button */}
      <aside style={printing ? { display: 'none' } : {}} className="w-[380px] bg-white shadow-2xl z-10 overflow-y-auto border-r border-gray-200">
        <div className="sticky top-0 bg-white p-8 border-b border-gray-100">
          {/* App header with logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <Truck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">DLOGS</h1>
              <p className="text-xs text-gray-500">Driver Logs Manager</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* HOS Cycle Hours Input */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100" style={{padding: 10}}>
            <label className="text-xs font-bold text-blue-700 uppercase block mb-3" style={{width: 200, display: 'inline-block'}}>
              📊 HOS Cycle Used
            </label>
            <input 
              type="number" 
              value={cycle_used} 
              onChange={e => setCycleUsed(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-800 font-semibold"
            />
          </div>

          {/* Address Input Fields for route configuration */}
          <div className="space-y-4">
            <AddressInput label="📍 Current Location" onSelect={l => setRoute(curr => [l, curr[1], curr[2]])} />
            <AddressInput label="📦 Pickup Point" onSelect={l => setRoute(curr => [curr[0], l, curr[2]])} />
            <AddressInput label="🎯 Drop-off Point" onSelect={l => setRoute(curr => [curr[0], curr[1], l])} />
          </div>

          {/* Main action button: Calculate HOS compliance for the route */}
          <button 
            onClick={handleCalculate} style={{marginTop: 10, marginBottom: 20, background: "#007bff"}}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <Clock size={20}/> RUN COMPLIANCE
          </button>

          {/* Compliance status indicator - shows after calculation */}
          {tripData && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-md">
              <div className="flex items-center gap-2 text-green-700 font-bold">
                <ShieldCheck size={20}/> HOS COMPLIANT
              </div>
              <p className="text-xs text-green-600 mt-2">Route analyzed for FMCSA 70h/8days rules.</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area: Route map and compliance logs display */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Route Map Section - hidden during printing */}
          <div style={printing ? { display: 'none' } : {}}>
            <div className="mb-6">
              <h2 className="text-3xl font-black text-gray-800 mb-2">Route Map</h2>
              <p className="text-sm text-gray-500">View your planned route and waypoints</p>
            </div>
            <TripMap center={userPos} locations={route} />
          </div>

          {/* Compliance Logs Section - shown after calculation */}
          {tripData && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-800 mb-2">📋 Compliance Logs</h2>
                <p className="text-sm text-gray-500">Daily HOS compliance breakdown</p>
              </div>
              
              <div className="space-y-8">
            {/* Render a LogSheet for each day of the trip */}
            {Object.entries(groupedLogs).map(([day, segments]) => {
              // Calculate the date for this day relative to today
              const dayOffset = parseInt(day) - 1;
              const logDate = new Date();
              logDate.setDate(logDate.getDate() + dayOffset);
              const formattedDate = logDate.toISOString().split('T')[0];
              
              return <LogSheet 
                key={day} 
                day={parseInt(day)} 
                segments={segments} 
                date={formattedDate}
                driverName="Driver name"
                carrierName="Company name"
                startCityName={route[0]?.name || ""}
                pickUpCityName={route[1]?.name || ""}
                dropOffCityName={route[2]?.name || ""}
                numberOfDays={Object.keys(groupedLogs).length}
              />
            })}
              
              {/* Print button - triggers browser print dialog and hides UI */}
              <button  style={printing ? { display: 'none' } : {marginTop: 20, marginBottom: 50, background: "#00f3ff"}} 
                onClick={() => {
                  setPrinting(true);
                  setTimeout(() => {
                    window.print();
                    setPrinting(false);
                  }, 500);
                }}
                className="w-full mt-8 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                🖨️ Print All Logs
              </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}