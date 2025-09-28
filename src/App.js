import './App.css';
import { useState } from 'react';
import TripForm from './Components/TripForm';
import RouteMap from './Components/RouteMap';
import EldLogSheet from './Components/EldLogSheet';

function App() {
  const [tripData, setTripData] = useState(null);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        🚛 Trip Planner & ELD Logs
      </h1>

      <TripForm onResult={setTripData} />

      {tripData && (
        <div className="mt-8 space-y-8">
          <RouteMap route={tripData.route} stops={tripData.stops} />
          <div>
            <h2 className="text-xl font-semibold mb-4">📊 ELD Logs</h2>
            {tripData.eld_logs.map((log) => (
              <EldLogSheet key={log.day} log={log} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
