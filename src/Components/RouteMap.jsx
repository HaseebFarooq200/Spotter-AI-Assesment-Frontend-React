import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function RouteMap({ route, stops }) {
  if (!route || !route.length || !route[0].legs) {
    return <div>No route data available</div>;
  }

  // Extract coordinates from legs
  const legs = route[0].legs;
  const coords = legs.flatMap((leg) => [
    [leg.start_location.lat, leg.start_location.lng],
    [leg.end_location.lat, leg.end_location.lng],
  ]);

  // Distribute stops evenly along route
  const stopsWithCoords = stops.map((stop, idx) => {
    const pos = coords[Math.floor((idx / stops.length) * (coords.length - 1))];
    return { ...stop, location: pos };
  });

  // Custom icons for fuel & rest
  const fuelIcon = L.divIcon({
    className: "custom-icon",
    html: `<div style="background: red; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const restIcon = L.divIcon({
    className: "custom-icon",
    html: `<div style="background: green; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        center={coords[0]}
        zoom={6}
        className="h-full w-full rounded-xl shadow-md"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={coords} color="blue" />

        {/* Stops markers */}
        {stopsWithCoords.map((stop, idx) => (
          <Marker
            key={idx}
            position={stop.location}
            icon={stop.type === "fuel" ? fuelIcon : restIcon}
          >
            <Popup>
              {stop.type.toUpperCase()} Stop (Day {stop.day || "?"})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
