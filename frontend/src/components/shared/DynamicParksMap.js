import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DynamicParksMap = ({ 
  parks = [], 
  height = '500px', 
  showConsoleLogs = true,
  isAdmin = false,
  onMarkerClick = null 
}) => {
  const { center, zoom, validParks } = useMemo(() => {
    const parksWithCoords = parks.filter(p => 
      p.latitude && p.longitude && 
      !isNaN(parseFloat(p.latitude)) && 
      !isNaN(parseFloat(p.longitude))
    );

    if (parksWithCoords.length === 0) {
      return { center: [28.6139, 77.2090], zoom: 13, validParks: [] };
    }

    if (parksWithCoords.length === 1) {
      return { center: [parseFloat(parksWithCoords[0].latitude), parseFloat(parksWithCoords[0].longitude)], zoom: 15, validParks: parksWithCoords };
    }

    const avgLat = parksWithCoords.reduce((sum, p) => sum + parseFloat(p.latitude), 0) / parksWithCoords.length;
    const avgLng = parksWithCoords.reduce((sum, p) => sum + parseFloat(p.longitude), 0) / parksWithCoords.length;
    return { center: [avgLat, avgLng], zoom: 12, validParks: parksWithCoords };
  }, [parks]);

  const handleMarkerClick = (park) => {
    if (showConsoleLogs) {
      console.log(`${isAdmin ? 'Admin' : 'User'} clicked marker:`, park.name);
    }
    if (onMarkerClick) {
      onMarkerClick(park);
    } else {
      alert(`${isAdmin ? 'Admin' : 'User'} clicked: ${park.name}\nOxygen Rating: ${park.oxygen_rating}/10`);
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} key={`${center[0]}-${center[1]}-${validParks.length}`}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validParks.map((park) => (
          <Marker key={park.id} position={[parseFloat(park.latitude), parseFloat(park.longitude)]} eventHandlers={{ click: () => handleMarkerClick(park) }}>
            <Popup>
              <div style={{ padding: '10px', minWidth: '200px' }}>
                <h3 style={{ color: '#059669', fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>{park.name}</h3>
                <p style={{ marginBottom: '6px' }}>
                  <strong>Oxygen Rating:</strong> {park.oxygen_rating}/10
                </p>
                <p style={{ marginBottom: '6px', fontSize: '14px' }}>{park.description}</p>
                {park.address && (
                  <p style={{ marginBottom: '6px', fontSize: '13px', color: '#666' }}>
                    📍 {park.address}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Features:</strong> {park.features}
                </p>
                {isAdmin && (
                  <div style={{ marginTop: '8px', padding: '4px', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #e0f2fe' }}>
                    <small style={{ color: '#0369a1', fontWeight: '500' }}>🔧 Admin View</small>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DynamicParksMap;


